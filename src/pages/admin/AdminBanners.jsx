import { useState } from "react";
import {
  Megaphone, Plus, Trash2, Pencil, Eye, EyeOff, ArrowUp, ArrowDown, X,
  HeartPulse, UserRound, ShieldAlert, Car, Volume2, BatteryCharging, Wifi, Zap, Percent, FileCheck2,
} from "lucide-react";
import { db } from "../../data/mockData";
import { PROMO_THEMES, PROMO_ILLUSTRATIONS, PROMO_ICONS } from "../../data/promoBanners";

const CATEGORY_ICONS = {
  HeartPulse, UserRound, ShieldAlert, Car, Volume2, BatteryCharging, Wifi, Zap, Percent, FileCheck2,
};

const EMPTY_FORM = {
  badge: "",
  headlineLine1: "",
  headlineLine2: "",
  subtitle: "",
  categories: [{ icon: "ShieldAlert", label: "" }],
  ctaLabel: "Explore",
  theme: "blue",
  illustration: "shield",
  link: "",
  external: true,
  appendMerchantParams: false,
  active: true,
};

function bannerToForm(b) {
  return {
    badge: b.badge,
    headlineLine1: b.headline[0] || "",
    headlineLine2: b.headline[1] || "",
    subtitle: b.subtitle,
    categories: b.categories.length ? b.categories : [{ icon: "ShieldAlert", label: "" }],
    ctaLabel: b.ctaLabel,
    theme: b.theme,
    illustration: b.illustration,
    link: b.link,
    external: b.external,
    appendMerchantParams: b.appendMerchantParams,
    active: b.active,
  };
}

function formToBanner(form) {
  return {
    badge: form.badge.trim(),
    headline: [form.headlineLine1.trim(), form.headlineLine2.trim()].filter(Boolean),
    subtitle: form.subtitle.trim(),
    categories: form.categories.filter((c) => c.label.trim()).map((c) => ({ icon: c.icon, label: c.label.trim() })),
    ctaLabel: form.ctaLabel.trim(),
    theme: form.theme,
    illustration: form.illustration,
    link: form.link.trim(),
    external: form.external,
    appendMerchantParams: form.external ? form.appendMerchantParams : false,
    active: form.active,
  };
}

function BannerForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setCategory = (idx, patch) =>
    setForm((f) => ({ ...f, categories: f.categories.map((c, i) => (i === idx ? { ...c, ...patch } : c)) }));
  const addCategory = () => setForm((f) => ({ ...f, categories: [...f.categories, { icon: "ShieldAlert", label: "" }] }));
  const removeCategory = (idx) => setForm((f) => ({ ...f, categories: f.categories.filter((_, i) => i !== idx) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.badge.trim() || !form.headlineLine1.trim() || !form.subtitle.trim() || !form.ctaLabel.trim() || !form.link.trim()) {
      setError("Please fill Badge, Headline line 1, Subtitle, CTA label and Link.");
      return;
    }
    onSave(formToBanner(form));
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4 border-l-4 border-green-500">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">Badge / Product Name *</label>
          <input
            value={form.badge}
            onChange={(e) => setField("badge", e.target.value)}
            placeholder="Thiru Insurance"
            className="w-full px-3.5 py-2 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">CTA Button Label *</label>
          <input
            value={form.ctaLabel}
            onChange={(e) => setField("ctaLabel", e.target.value)}
            placeholder="Explore Plans"
            className="w-full px-3.5 py-2 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">Headline — Line 1 *</label>
          <input
            value={form.headlineLine1}
            onChange={(e) => setField("headlineLine1", e.target.value)}
            placeholder="Protect your family."
            className="w-full px-3.5 py-2 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">Headline — Line 2 (optional)</label>
          <input
            value={form.headlineLine2}
            onChange={(e) => setField("headlineLine2", e.target.value)}
            placeholder="Secure your future."
            className="w-full px-3.5 py-2 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-green-500 mb-1.5">Subtitle *</label>
        <textarea
          value={form.subtitle}
          onChange={(e) => setField("subtitle", e.target.value)}
          rows={2}
          placeholder="Affordable and trusted insurance plans for you and your loved ones."
          className="w-full px-3.5 py-2 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-green-500 mb-1.5">Feature Chips</label>
        <div className="space-y-2">
          {form.categories.map((c, idx) => (
            <div key={idx} className="flex gap-2">
              <select
                value={c.icon}
                onChange={(e) => setCategory(idx, { icon: e.target.value })}
                className="px-2.5 py-2 rounded-lg border border-green-100 text-sm bg-white"
              >
                {PROMO_ICONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <input
                value={c.label}
                onChange={(e) => setCategory(idx, { label: e.target.value })}
                placeholder="Health Insurance"
                className="flex-1 px-3.5 py-2 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
              />
              {form.categories.length > 1 && (
                <button type="button" onClick={() => removeCategory(idx)} className="text-rose-500 hover:text-rose-700 px-2">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addCategory} className="text-xs font-semibold text-green-600 hover:underline mt-2">
          + Add another chip
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">Theme Color</label>
          <select
            value={form.theme}
            onChange={(e) => setField("theme", e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-green-100 text-sm bg-white"
          >
            {PROMO_THEMES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">Illustration</label>
          <select
            value={form.illustration}
            onChange={(e) => setField("illustration", e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-green-100 text-sm bg-white"
          >
            {PROMO_ILLUSTRATIONS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-green-500 mb-1.5">
          Link {form.external ? "(full URL)" : "(internal path, e.g. /merchant/services)"} *
        </label>
        <input
          value={form.link}
          onChange={(e) => setField("link", e.target.value)}
          placeholder={form.external ? "https://thiruinsurance.com" : "/merchant/services"}
          className="w-full px-3.5 py-2 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-green-700 cursor-pointer">
          <input type="checkbox" checked={form.external} onChange={(e) => setField("external", e.target.checked)} className="w-4 h-4" />
          External link (opens new tab)
        </label>
        {form.external && (
          <label className="flex items-center gap-2 text-sm text-green-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.appendMerchantParams}
              onChange={(e) => setField("appendMerchantParams", e.target.checked)}
              className="w-4 h-4"
            />
            Append merchant_id &amp; business_name to link
          </label>
        )}
        <label className="flex items-center gap-2 text-sm text-green-700 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} className="w-4 h-4" />
          Active (visible to merchants)
        </label>
      </div>

      {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg">
          Save Banner
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-green-500 px-5 py-2 rounded-lg hover:bg-green-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminBanners() {
  const [tick, setTick] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const banners = db.getPromoBanners();

  const refresh = () => setTick((t) => t + 1);

  const handleAdd = (data) => {
    db.addPromoBanner(data);
    setShowForm(false);
    refresh();
  };

  const handleEdit = (data) => {
    db.updatePromoBanner(editingId, data);
    setEditingId(null);
    refresh();
  };

  const toggleActive = (b) => {
    db.updatePromoBanner(b.banner_id, { active: !b.active });
    refresh();
  };

  const remove = (b) => {
    if (!window.confirm(`Delete "${b.badge}" banner? This cannot be undone.`)) return;
    db.removePromoBanner(b.banner_id);
    refresh();
  };

  const move = (b, dir) => {
    db.movePromoBanner(b.banner_id, dir);
    refresh();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display font-bold text-2xl text-green-700 flex items-center gap-2">
          <Megaphone size={22} /> Promo Banners
        </h1>
        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            <Plus size={15} /> Add Banner
          </button>
        )}
      </div>
      <p className="text-sm text-green-300 mb-6">
        Control what merchants see in the Dashboard carousel — order, on/off, and content.
      </p>

      {showForm && (
        <div className="mb-6">
          <BannerForm initial={EMPTY_FORM} onCancel={() => setShowForm(false)} onSave={handleAdd} />
        </div>
      )}

      <div className="space-y-3">
        {banners.map((b, idx) => (
          <div key={b.banner_id}>
            {editingId === b.banner_id ? (
              <BannerForm initial={bannerToForm(b)} onCancel={() => setEditingId(null)} onSave={handleEdit} />
            ) : (
              <div className="card p-5 flex items-center gap-4">
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => move(b, -1)}
                    disabled={idx === 0}
                    className="text-green-400 hover:text-green-700 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    onClick={() => move(b, 1)}
                    disabled={idx === banners.length - 1}
                    className="text-green-400 hover:text-green-700 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={15} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-green-700 text-sm">{b.badge}</p>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        b.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {b.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-xs text-green-300 truncate mt-0.5">
                    {b.headline.join(" ")} · {b.categories.length} chips · {b.external ? "External" : "Internal"} link
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(b)}
                    title={b.active ? "Hide from merchants" : "Show to merchants"}
                    className="text-green-500 hover:text-green-700 p-1.5"
                  >
                    {b.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => setEditingId(b.banner_id)} className="text-blue-500 hover:text-blue-700 p-1.5">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(b)} className="text-rose-500 hover:text-rose-700 p-1.5">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {banners.length === 0 && !showForm && (
          <p className="text-sm text-green-300 text-center py-10 card">No promo banners yet — add one to get started.</p>
        )}
      </div>
    </div>
  );
}