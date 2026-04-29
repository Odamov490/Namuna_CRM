import { useState } from 'react';
import { sampleService } from '../../lib/firebase.js';
import { Modal, Button, Input, Select, Textarea } from '../ui/index.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { generateBarcode, isValidPhone } from '../../lib/utils.js';
import { RefreshCw } from 'lucide-react';

const PRODUCT_TYPES = [
  'Oziq-ovqat mahsuloti',
  'Elektrotexnika',
  'Qurilish materiali',
  'Mashinasozlik qismi',
  'Polimer mahsuloti',
  'Yengil sanoat',
  "Bolalar o'yinchoqi",
  'Boshqa',
];

const INITIAL_FORM = {
  barcode: '',
  productName: '',
  applicantName: '',
  applicantPhone: '',
  productType: '',
  initialLabId: '',
  note: '',
};

export default function AddSampleModal({ open, onClose, labs = [] }) {
  const { user, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...INITIAL_FORM, barcode: generateBarcode() });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.barcode?.trim())       e.barcode       = 'Barcode kiritilishi shart';
    if (!form.productName?.trim())   e.productName   = 'Mahsulot nomi kiritilishi shart';
    if (!form.applicantName?.trim()) e.applicantName = 'Ariza beruvchi ismi kiritilishi shart';
    if (!form.initialLabId)          e.initialLabId  = 'Laboratoriya tanlanishi shart';
    if (form.applicantPhone && !isValidPhone(form.applicantPhone)) {
      e.applicantPhone = "To'g'ri telefon raqam kiriting";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await sampleService.create(form, user.uid);
      showToast("Namuna muvaffaqiyatli qo'shildi ✅", 'success');
      setForm({ ...INITIAL_FORM, barcode: generateBarcode() });
      setErrors({});
      onClose();
    } catch (e) {
      showToast(e.message || 'Xato yuz berdi', 'error');
    }
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setForm({ ...INITIAL_FORM, barcode: generateBarcode() });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Yangi namuna qo'shish"
      size="md"
    >
      <div className="space-y-4">
        {/* Barcode row */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Barcode / QR kod"
              required
              value={form.barcode}
              onChange={e => set('barcode', e.target.value.toUpperCase())}
              error={errors.barcode}
              placeholder="NK240001"
              className="font-mono tracking-wider"
            />
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => set('barcode', generateBarcode())}
            title="Yangi barcode generatsiya qilish"
            className="mb-0.5 flex-shrink-0 h-[42px] w-[42px]"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <Input
          label="Mahsulot nomi"
          required
          value={form.productName}
          onChange={e => set('productName', e.target.value)}
          error={errors.productName}
          placeholder="Mahsulot nomini kiriting"
        />

        <Select
          label="Mahsulot turi"
          value={form.productType}
          onChange={e => set('productType', e.target.value)}
        >
          <option value="">— Tanlang —</option>
          {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ariza beruvchi"
            required
            value={form.applicantName}
            onChange={e => set('applicantName', e.target.value)}
            error={errors.applicantName}
            placeholder="F.I.Sh."
          />
          <Input
            label="Telefon"
            type="tel"
            value={form.applicantPhone}
            onChange={e => set('applicantPhone', e.target.value)}
            error={errors.applicantPhone}
            placeholder="+998 90 000 00 00"
          />
        </div>

        <Select
          label="Boshlang'ich laboratoriya"
          required
          value={form.initialLabId}
          onChange={e => set('initialLabId', e.target.value)}
          error={errors.initialLabId}
        >
          <option value="">— Laboratoriya tanlang —</option>
          {labs.filter(l => l.isActive !== false).map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </Select>

        <Textarea
          label="Izoh"
          value={form.note}
          onChange={e => set('note', e.target.value)}
          rows={2}
          placeholder="Qo'shimcha ma'lumot..."
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1" disabled={loading}>
            Bekor
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            Qo'shish
          </Button>
        </div>
      </div>
    </Modal>
  );
}
