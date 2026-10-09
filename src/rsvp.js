export function validateRsvp({ name, attendance, pax } = {}) {
  const errors = {};
  if (typeof name !== 'string' || !name.trim()) errors.name = 'Sila masukkan nama anda.';
  else if (name.trim().length > 120) errors.name = 'Nama mestilah tidak melebihi 120 aksara.';
  if (!['yes', 'no'].includes(attendance)) errors.attendance = 'Sila pilih status kehadiran.';
  if (attendance === 'yes' && (!Number.isInteger(Number(pax)) || Number(pax) < 1 || Number(pax) > 99)) {
    errors.pax = 'Sila masukkan bilangan tetamu antara 1 hingga 99, termasuk anda.';
  }
  return errors;
}

export async function submitRsvp(values) {
  const errors = validateRsvp(values);
  if (Object.keys(errors).length) return { ok: false, errors };
  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: values.name.trim(), attendance: values.attendance, pax: values.attendance === 'yes' ? Number(values.pax) : 0 }),
    });
    const result = await response.json();
    if (response.ok && result.ok === true) return { ok: true, attendance: values.attendance };
    return { ok: false, errors: result.errors, message: 'RSVP belum dapat disahkan. Sila cuba lagi sebentar atau hubungi penganjur.' };
  } catch {
    return { ok: false, message: 'Sambungan terganggu. RSVP belum dapat disahkan. Sila semak internet anda dan cuba lagi.' };
  }
}
