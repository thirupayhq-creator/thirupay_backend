// Static demo lookup (frontend-only). Real integration would call India Post Pincode API.
export const PINCODE_MAP = {
  625001: { city: "Madurai", state: "Tamil Nadu" },
  625002: { city: "Madurai", state: "Tamil Nadu" },
  625020: { city: "Madurai", state: "Tamil Nadu" },
  600001: { city: "Chennai", state: "Tamil Nadu" },
  600017: { city: "Chennai", state: "Tamil Nadu" },
  600040: { city: "Chennai", state: "Tamil Nadu" },
  641001: { city: "Coimbatore", state: "Tamil Nadu" },
  620001: { city: "Tiruchirappalli", state: "Tamil Nadu" },
  636001: { city: "Salem", state: "Tamil Nadu" },
  632001: { city: "Vellore", state: "Tamil Nadu" },
  628001: { city: "Tuticorin", state: "Tamil Nadu" },
  627001: { city: "Tirunelveli", state: "Tamil Nadu" },
  560001: { city: "Bengaluru", state: "Karnataka" },
  500001: { city: "Hyderabad", state: "Telangana" },
  400001: { city: "Mumbai", state: "Maharashtra" },
  110001: { city: "New Delhi", state: "Delhi" },
};

export function lookupPincode(pincode) {
  return PINCODE_MAP[pincode] || null;
}
