import { createContext, useContext, useState, useCallback } from "react";
import { db, genId } from "../data/mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => db.getSession());

  const login = useCallback((email, password) => {
    const user = db.findUserByEmail(email);
    if (user) {
      if (user.password !== password) return { ok: false, error: "Incorrect password." };

      let merchant = null;
      if (user.role === "merchant") {
        merchant = db.getMerchantByUserId(user.id);
      }

      const newSession = { userId: user.id, role: user.role, name: user.name, merchantId: merchant?.merchant_id || null, adminRole: null, adminStaffId: null };
      db.setSession(newSession);
      setSessionState(newSession);
      return { ok: true, session: newSession };
    }

    // Not a registered owner/Sir account — check ThiruPay's internal admin staff
    const staff = db.getAdminStaffByEmail(email);
    if (!staff) return { ok: false, error: "No account found. Please check your email." };
    if (staff.password !== password) return { ok: false, error: "Incorrect password." };
    if (staff.status !== "active") return { ok: false, error: "This staff account has been deactivated. Contact your admin." };

    const newSession = {
      userId: staff.staff_id,
      role: "admin",
      name: staff.name,
      merchantId: null,
      adminRole: staff.role,
      adminStaffId: staff.staff_id,
    };
    db.setSession(newSession);
    setSessionState(newSession);
    return { ok: true, session: newSession };
  }, []);

  const registerMerchant = useCallback((form) => {
    if (db.isEmailTaken(form.email)) return { ok: false, error: "This email is already registered." };
    if (!form.phoneVerified) return { ok: false, error: "Please verify your mobile number with OTP before continuing." };

    const userId = genId("u");
    const merchantId = genId("m");

    try {
      db.addUser({ id: userId, name: form.ownerName, email: form.email, phone: form.phone, role: "merchant", password: form.password });

      db.addMerchant({
        merchant_id: merchantId,
        user_id: userId,
        business_name: form.businessName,
        owner_name: form.ownerName,
        email: form.email,
        phone: form.phone,
        gst: form.gst || "",
        business_category: form.businessCategory || "",
        entity_type: form.entityType || "",
        status: "pending",
        registered_at: new Date().toISOString(),
        address_line1: form.addressLine1 || "",
        address_line2: form.addressLine2 || "",
        pincode: form.pincode || "",
        city: form.city || "",
        state: form.state || "",
        business_photo: form.businessPhoto || "",
        account_holder: form.accountHolder || "",
        account_number: form.accountNumber || "",
        ifsc: form.ifsc || "",
        bank_name: form.bankName || "",
        branch: form.branch || "",
        bank_verification_status: "pending",
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      // Roll back the partially-created user so the email isn't stuck as "already registered"
      db.removeUser(userId);
      if (err.message === "STORAGE_QUOTA_EXCEEDED") {
        return { ok: false, error: "Storage is full — please reduce the business photo size (try a smaller image)." };
      }
      return { ok: false, error: "Registration could not be saved, please try again." };
    }

    const newSession = { userId, role: "merchant", name: form.ownerName, merchantId, adminRole: null, adminStaffId: null };
    db.setSession(newSession);
    setSessionState(newSession);
    return { ok: true, session: newSession };
  }, []);

  const resetPassword = useCallback((email, newPassword) => {
    const user = db.findUserByEmail(email);
    if (!user) return { ok: false, error: "No account found for this email." };
    db.updateUserPassword(email, newPassword);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    db.clearSession();
    setSessionState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, registerMerchant, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
