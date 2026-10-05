import { useState } from "react";
import { LogIn, LogOut, Clock3, CalendarPlus, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db, genId } from "../../data/mockData";
import StatusBadge from "../../components/StatusBadge";

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
  return ((new Date(outIso) - new Date(inIso)) / 3600000).toFixed(1);
}

export default function MyAttendance() {
  const { session } = useAuth();
  const [tick, setTick] = useState(0);
  const staffId = session.adminStaffId;
  const today = todayStr();

  const todayRecord = db.getTodayAttendance(staffId, today);
  const history = db.getAttendanceByStaff(staffId).slice(0, 14);
  const myLeaves = db.getLeavesByStaff(staffId);

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ from: "", to: "", reason: "" });

  const handleCheckIn = () => {
    db.checkIn(staffId, today);
    setTick((t) => t + 1);
  };
  const handleCheckOut = () => {
    db.checkOut(staffId, today);
    setTick((t) => t + 1);
  };

  const submitLeave = (e) => {
    e.preventDefault();
    if (!leaveForm.from || !leaveForm.to) return;
    db.addLeaveRequest({
      leave_id: genId("leave"),
      staff_id: staffId,
      ...leaveForm,
      status: "pending",
      created_at: new Date().toISOString(),
    });
    setLeaveForm({ from: "", to: "", reason: "" });
    setShowLeaveForm(false);
    setTick((t) => t + 1);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">My Attendance</h1>
      <p className="text-sm text-green-300 mb-6">Check in/out for today and manage your own leave requests.</p>

      {/* Today's check-in card */}
      <div className="card p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">Today — {fmtDate(today)}</p>
          <p className="text-sm text-green-600">
            Check in: <span className="font-semibold text-green-700">{fmtTime(todayRecord?.check_in)}</span>
            {"  ·  "}
            Check out: <span className="font-semibold text-green-700">{fmtTime(todayRecord?.check_out)}</span>
          </p>
          {hoursBetween(todayRecord?.check_in, todayRecord?.check_out) && (
            <p className="text-xs text-green-400 mt-1">{hoursBetween(todayRecord?.check_in, todayRecord?.check_out)} hrs worked</p>
          )}
        </div>
        {!todayRecord ? (
          <button
            onClick={handleCheckIn}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <LogIn size={16} /> Check In
          </button>
        ) : !todayRecord.check_out ? (
          <button
            onClick={handleCheckOut}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Check Out
          </button>
        ) : (
          <span className="text-sm font-semibold text-green-400">Done for today ✓</span>
        )}
      </div>

      {/* Attendance history */}
      <div className="card overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-green-50">
          <h2 className="font-semibold text-green-700 text-sm">My Attendance History</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
            <tr>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-left px-5 py-3">Check In</th>
              <th className="text-left px-5 py-3">Check Out</th>
              <th className="text-left px-5 py-3">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50">
            {history.map((a) => (
              <tr key={a.attendance_id}>
                <td className="px-5 py-3 text-green-600">{fmtDate(a.date)}</td>
                <td className="px-5 py-3 text-green-500">{fmtTime(a.check_in)}</td>
                <td className="px-5 py-3 text-green-500">{fmtTime(a.check_out)}</td>
                <td className="px-5 py-3 text-green-500">{hoursBetween(a.check_in, a.check_out) ? `${hoursBetween(a.check_in, a.check_out)} hrs` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && <p className="text-sm text-green-300 text-center py-8">No attendance recorded yet.</p>}
      </div>

      {/* My leave requests */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-green-700">My Leave Requests</h2>
          <button
            onClick={() => setShowLeaveForm((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            {showLeaveForm ? <X size={13} /> : <CalendarPlus size={13} />} {showLeaveForm ? "Cancel" : "Request Leave"}
          </button>
        </div>

        {showLeaveForm && (
          <form onSubmit={submitLeave} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 bg-green-50/60 rounded-xl p-4">
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">From</label>
              <input required type="date" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-green-100 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">To</label>
              <input required type="date" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-green-100 text-sm outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-green-500 mb-1.5">Reason</label>
              <input value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-green-100 text-sm outline-none" />
            </div>
            <button type="submit" className="sm:col-span-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
              Submit Leave Request
            </button>
          </form>
        )}

        {myLeaves.length === 0 ? (
          <p className="text-sm text-green-300 text-center py-6">No leave requests yet.</p>
        ) : (
          <div className="divide-y divide-green-50">
            {myLeaves.map((l) => (
              <div key={l.leave_id} className="py-3 flex items-center justify-between gap-4">
                <p className="text-xs text-green-500 flex items-center gap-1.5">
                  <Clock3 size={12} /> {fmtDate(l.from)} → {fmtDate(l.to)} {l.reason && `· ${l.reason}`}
                </p>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
