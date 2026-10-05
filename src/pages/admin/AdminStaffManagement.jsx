import { useState } from "react";
import { Search, Plus, X, Pencil, Trash2, LogIn, LogOut, Check, Clock3 } from "lucide-react";
import { db, genId } from "../../data/mockData";
import { ADMIN_ROLES } from "../../data/adminRoles";
import StatusBadge from "../../components/StatusBadge";

const TABS = ["Staff", "Attendance", "Leave Requests"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function hoursBetween(inIso, outIso) {
  if (!inIso || !outIso) return null;
  const ms = new Date(outIso) - new Date(inIso);
  const hrs = ms / 3600000;
  return hrs.toFixed(1);
}

const emptyForm = { name: "", email: "", mobile: "", role: ADMIN_ROLES[0], branch: "", username: "", password: "" };

export default function AdminStaffManagement() {
  const [tab, setTab] = useState("Staff");
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const staffList = db.getAdminStaff();

  // ---------- Staff tab state ----------
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const branches = Array.from(new Set(staffList.map((s) => s.branch).filter(Boolean)));

  const filteredStaff = staffList.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase()) && !s.employee_id.toLowerCase().includes(query.toLowerCase())) return false;
    if (roleFilter !== "All" && s.role !== roleFilter) return false;
    if (branchFilter !== "All" && s.branch !== branchFilter) return false;
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    return true;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditingId(s.staff_id);
    setForm({ name: s.name, email: s.email, mobile: s.mobile, role: s.role, branch: s.branch, username: s.username, password: s.password });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.mobile || !form.username || !form.password) {
      setFormError("Please fill all required fields.");
      return;
    }
    if (form.email && db.isEmailTaken(form.email, { excludeStaffId: editingId })) {
      setFormError("This email is already registered as a merchant or another staff account.");
      return;
    }
    if (editingId) {
      db.updateAdminStaff(editingId, form);
    } else {
      db.addAdminStaff({
        staff_id: genId("astaff"),
        employee_id: `EMP-${1000 + staffList.length + 1}`,
        ...form,
        status: "active",
        created_at: new Date().toISOString(),
      });
    }
    setShowForm(false);
    refresh();
  };

  const toggleStatus = (s) => {
    db.updateAdminStaff(s.staff_id, { status: s.status === "active" ? "inactive" : "active" });
    refresh();
  };

  const handleDelete = (staffId) => {
    db.removeAdminStaff(staffId);
    refresh();
  };

  // ---------- Attendance tab ----------
  const today = todayStr();
  const attendanceLog = db.getAllAttendance().slice(0, 20);
  const staffMap = Object.fromEntries(staffList.map((s) => [s.staff_id, s]));

  const handleCheckIn = (staffId) => {
    db.checkIn(staffId, today);
    refresh();
  };
  const handleCheckOut = (staffId) => {
    db.checkOut(staffId, today);
    refresh();
  };

  // ---------- Leave tab ----------
  const [leaveForm, setLeaveForm] = useState({ staff_id: "", from: "", to: "", reason: "" });
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const leaves = db.getAllLeaves();

  const submitLeave = (e) => {
    e.preventDefault();
    if (!leaveForm.staff_id || !leaveForm.from || !leaveForm.to) return;
    db.addLeaveRequest({
      leave_id: genId("leave"),
      ...leaveForm,
      status: "pending",
      created_at: new Date().toISOString(),
    });
    setLeaveForm({ staff_id: "", from: "", to: "", reason: "" });
    setShowLeaveForm(false);
    refresh();
  };

  const decideLeave = (leaveId, status) => {
    db.updateLeaveStatus(leaveId, status);
    refresh();
  };

  return (
    <div className="max-w-5xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Staff Management</h1>
      <p className="text-sm text-green-300 mb-6">Manage ThiruPay's internal team — roles, attendance, and leave.</p>

      <div className="flex gap-1 bg-green-50 rounded-lg p-1 mb-6 w-fit">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`text-xs font-semibold px-4 py-2 rounded-md transition-colors ${
              tab === tb ? "bg-white text-green-700 shadow-sm" : "text-green-400"
            }`}
          >
            {tb}
          </button>
        ))}
      </div>

      {/* ---------------- STAFF TAB ---------------- */}
      {tab === "Staff" && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or employee ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500 bg-white"
              />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-green-100 text-sm bg-white outline-none">
              <option>All</option>
              {ADMIN_ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-green-100 text-sm bg-white outline-none">
              <option>All</option>
              {branches.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-green-100 text-sm bg-white outline-none">
              <option>All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={14} /> Add Staff
            </button>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="text-left px-5 py-3">Employee</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Mobile</th>
                  <th className="text-left px-5 py-3">Branch</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {filteredStaff.map((s) => (
                  <tr key={s.staff_id} className="hover:bg-green-50/50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-green-700">{s.name}</p>
                      <p className="text-xs text-green-300 font-mono">{s.employee_id}</p>
                    </td>
                    <td className="px-5 py-3 text-green-600">{s.role}</td>
                    <td className="px-5 py-3 text-green-500">{s.mobile}</td>
                    <td className="px-5 py-3 text-green-500">{s.branch || "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="text-green-400 hover:text-green-700 p-1.5" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => toggleStatus(s)} className="text-xs font-semibold text-green-500 border border-green-100 px-2.5 py-1 rounded-lg hover:bg-green-50">
                          {s.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => handleDelete(s.staff_id)} className="text-rose-500 hover:text-rose-700 p-1.5" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStaff.length === 0 && <p className="text-sm text-green-300 text-center py-10">No staff found.</p>}
          </div>
        </>
      )}

      {/* ---------------- ATTENDANCE TAB ---------------- */}
      {tab === "Attendance" && (
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-green-50 flex items-center justify-between">
              <h2 className="font-semibold text-green-700 text-sm">Today — {fmtDate(today)}</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="text-left px-5 py-3">Employee</th>
                  <th className="text-left px-5 py-3">Check In</th>
                  <th className="text-left px-5 py-3">Check Out</th>
                  <th className="text-left px-5 py-3">Hours</th>
                  <th className="text-right px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {staffList.filter((s) => s.status === "active").map((s) => {
                  const rec = db.getTodayAttendance(s.staff_id, today);
                  return (
                    <tr key={s.staff_id}>
                      <td className="px-5 py-3 font-medium text-green-700">{s.name}</td>
                      <td className="px-5 py-3 text-green-500">{fmtTime(rec?.check_in)}</td>
                      <td className="px-5 py-3 text-green-500">{fmtTime(rec?.check_out)}</td>
                      <td className="px-5 py-3 text-green-500">{hoursBetween(rec?.check_in, rec?.check_out) ? `${hoursBetween(rec?.check_in, rec?.check_out)} hrs` : "—"}</td>
                      <td className="px-5 py-3 text-right">
                        {!rec ? (
                          <button onClick={() => handleCheckIn(s.staff_id)} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 ml-auto">
                            <LogIn size={13} /> Check In
                          </button>
                        ) : !rec.check_out ? (
                          <button onClick={() => handleCheckOut(s.staff_id)} className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 ml-auto">
                            <LogOut size={13} /> Check Out
                          </button>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 justify-end">
                            <Check size={13} /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {staffList.filter((s) => s.status === "active").length === 0 && (
              <p className="text-sm text-green-300 text-center py-10">No active staff yet — add staff in the Staff tab first.</p>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-green-50">
              <h2 className="font-semibold text-green-700 text-sm">Recent Attendance</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Employee</th>
                  <th className="text-left px-5 py-3">Check In</th>
                  <th className="text-left px-5 py-3">Check Out</th>
                  <th className="text-left px-5 py-3">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {attendanceLog.map((a) => (
                  <tr key={a.attendance_id}>
                    <td className="px-5 py-3 text-green-500">{fmtDate(a.date)}</td>
                    <td className="px-5 py-3 font-medium text-green-700">{staffMap[a.staff_id]?.name || "—"}</td>
                    <td className="px-5 py-3 text-green-500">{fmtTime(a.check_in)}</td>
                    <td className="px-5 py-3 text-green-500">{fmtTime(a.check_out)}</td>
                    <td className="px-5 py-3 text-green-500">{hoursBetween(a.check_in, a.check_out) ? `${hoursBetween(a.check_in, a.check_out)} hrs` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendanceLog.length === 0 && <p className="text-sm text-green-300 text-center py-10">No attendance recorded yet.</p>}
          </div>
        </div>
      )}

      {/* ---------------- LEAVE TAB ---------------- */}
      {tab === "Leave Requests" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowLeaveForm((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              {showLeaveForm ? <X size={14} /> : <Plus size={14} />} {showLeaveForm ? "Cancel" : "Add Leave Request"}
            </button>
          </div>

          {showLeaveForm && (
            <form onSubmit={submitLeave} className="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Staff</label>
                <select
                  required
                  value={leaveForm.staff_id}
                  onChange={(e) => setLeaveForm({ ...leaveForm, staff_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm bg-white outline-none"
                >
                  <option value="" disabled>Select staff...</option>
                  {staffList.map((s) => <option key={s.staff_id} value={s.staff_id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">From</label>
                  <input required type="date" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">To</label>
                  <input required type="date" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Reason</label>
                <input value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none" />
              </div>
              <button type="submit" className="sm:col-span-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                Submit Leave Request
              </button>
            </form>
          )}

          <div className="card divide-y divide-green-50">
            {leaves.map((l) => (
              <div key={l.leave_id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-green-700">{staffMap[l.staff_id]?.name || "—"}</p>
                  <p className="text-xs text-green-400 flex items-center gap-1.5 mt-0.5">
                    <Clock3 size={12} /> {fmtDate(l.from)} → {fmtDate(l.to)} {l.reason && `· ${l.reason}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={l.status} />
                  {l.status === "pending" && (
                    <>
                      <button onClick={() => decideLeave(l.leave_id, "approved")} className="text-xs font-semibold text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50">
                        Approve
                      </button>
                      <button onClick={() => decideLeave(l.leave_id, "rejected")} className="text-xs font-semibold text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-50">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {leaves.length === 0 && <p className="text-sm text-green-300 text-center py-10">No leave requests yet.</p>}
          </div>
        </div>
      )}

      {/* ---------------- ADD/EDIT STAFF MODAL ---------------- */}
      {showForm && (
        <div className="fixed inset-0 bg-green-900/50 flex items-center justify-center z-50 px-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-green-700">{editingId ? "Edit Staff" : "Add Staff"}</h3>
              <button onClick={() => setShowForm(false)} className="text-green-300 hover:text-green-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Mobile Number</label>
                <input required type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm bg-white outline-none">
                    {ADMIN_ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Branch</label>
                  <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="e.g. Chennai" className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Username</label>
                  <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Password</label>
                  <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              {formError && <p className="text-xs text-rose-600">{formError}</p>}
              <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mt-2">
                {editingId ? "Save Changes" : "Add Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
