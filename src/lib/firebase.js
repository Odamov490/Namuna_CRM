import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
} from 'firebase/auth';
import {
  getFirestore, collection, doc,
  getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where,
  orderBy, limit, onSnapshot,
  serverTimestamp, increment,
} from 'firebase/firestore';

// ─── Config ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'demo-key',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'demo.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'demo-project',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:000:web:000',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ─── STATUS CONSTANTS ─────────────────────────────────────────
export const STATUS = {
  RECEIVED:      'received',
  WAITING:       'waiting',
  TESTING:       'testing',
  COMPLIANT:     'compliant',
  NON_COMPLIANT: 'non_compliant',
  TRANSFERRED:   'transferred',
  COMPLETED:     'completed',
};

export const STATUS_LABELS = {
  received:      { uz: 'Qabul qilindi',  color: 'bg-blue-100 text-blue-700',    icon: '📥' },
  waiting:       { uz: 'Navbatda',       color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  testing:       { uz: 'Sinovda',        color: 'bg-purple-100 text-purple-700', icon: '🔬' },
  compliant:     { uz: 'Muvofiq',        color: 'bg-green-100 text-green-700',   icon: '✅' },
  non_compliant: { uz: 'Nomuvofiq',      color: 'bg-red-100 text-red-700',       icon: '❌' },
  transferred:   { uz: "Ko'chirildi",    color: 'bg-indigo-100 text-indigo-700', icon: '🔄' },
  completed:     { uz: 'Yakunlandi',     color: 'bg-gray-100 text-gray-700',     icon: '🏁' },
};

export const LAB_TYPES = {
  oziq_ovqat:    "Oziq-ovqat",
  elektrotexnika:"Elektrotexnika",
  qurilish:      "Qurilish",
  mashinasozlik: "Mashinasozlik",
  polimer:       "Polimer-kimyo",
  yengil:        "Yengil sanoat",
  bolalar:       "Bolalar o'yinchoqlari",
};

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  LAB_MANAGER: 'lab_manager',
  TECHNICIAN:  'technician',
  OBSERVER:    'observer',
};

// ═══════════════════════════════════════════════════════════════
// AUTH SERVICE
// ═══════════════════════════════════════════════════════════════
export const authService = {
  async registerWithEmail(email, password, displayName, role = 'observer', labId = null) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await userService.createProfile(cred.user.uid, { displayName, email, role, labId });
    return cred;
  },

  loginWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
  logout:         () => signOut(auth),
  onAuthChange:   (cb) => onAuthStateChanged(auth, cb),
};

// ═══════════════════════════════════════════════════════════════
// USER SERVICE
// ═══════════════════════════════════════════════════════════════
export const userService = {
  async createProfile(uid, data) {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      role: data.role || 'observer',
      labId: data.labId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async getProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async updateProfile(uid, data) {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
  },

  async getAll() {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async setRole(uid, role, labId = null) {
    await updateDoc(doc(db, 'users', uid), { role, labId });
  },
};

// ═══════════════════════════════════════════════════════════════
// LABORATORY SERVICE
// ═══════════════════════════════════════════════════════════════
export const labService = {
  async create(data) {
    return addDoc(collection(db, 'laboratories'), {
      ...data,
      capacity: data.capacity || 50,
      currentLoad: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async get(id) {
    const snap = await getDoc(doc(db, 'laboratories', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async getAll() {
    const snap = await getDocs(query(collection(db, 'laboratories'), orderBy('name')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async update(id, data) {
    await updateDoc(doc(db, 'laboratories', id), { ...data, updatedAt: serverTimestamp() });
  },

  async delete(id) {
    await deleteDoc(doc(db, 'laboratories', id));
  },

  subscribeToAll(cb) {
    return onSnapshot(
      query(collection(db, 'laboratories'), orderBy('name')),
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },

  async incrementLoad(id, delta = 1) {
    await updateDoc(doc(db, 'laboratories', id), {
      currentLoad: increment(delta),
      updatedAt: serverTimestamp(),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// SAMPLE SERVICE
// ═══════════════════════════════════════════════════════════════
export const sampleService = {
  async create(data, createdBy) {
    const ref = await addDoc(collection(db, 'samples'), {
      ...data,
      currentStatus: STATUS.RECEIVED,
      currentLabId: data.initialLabId || null,
      labsVisited: data.initialLabId ? [data.initialLabId] : [],
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Create first history record
    if (data.initialLabId) {
      await historyService.add({
        sampleId:   ref.id,
        labId:      data.initialLabId,
        oldStatus:  null,
        newStatus:  STATUS.RECEIVED,
        employeeId: createdBy,
        note:       'Namuna qabul qilindi',
      });
      await labService.incrementLoad(data.initialLabId, 1);
    }
    return ref;
  },

  async get(id) {
    const snap = await getDoc(doc(db, 'samples', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async getByBarcode(barcode) {
    const q = query(collection(db, 'samples'), where('barcode', '==', barcode), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  async getAll({ labId, status, search } = {}) {
    let q = query(collection(db, 'samples'), orderBy('updatedAt', 'desc'));
    if (labId)  q = query(collection(db, 'samples'), where('currentLabId', '==', labId), orderBy('updatedAt', 'desc'));
    if (status) q = query(collection(db, 'samples'), where('currentStatus', '==', status), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    let samples = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (search) {
      const s = search.toLowerCase();
      samples = samples.filter(x =>
        x.barcode?.toLowerCase().includes(s) ||
        x.productName?.toLowerCase().includes(s) ||
        x.applicantName?.toLowerCase().includes(s)
      );
    }
    return samples;
  },

  async updateStatus(id, newStatus, employeeId, labId, note = '') {
    const sample = await sampleService.get(id);
    if (!sample) throw new Error('Namuna topilmadi');
    const oldStatus = sample.currentStatus;

    await updateDoc(doc(db, 'samples', id), {
      currentStatus: newStatus,
      updatedAt: serverTimestamp(),
    });

    await historyService.add({
      sampleId:   id,
      labId:      labId || sample.currentLabId,
      oldStatus,
      newStatus,
      employeeId,
      note,
    });

    // Alert: if completed or non-compliant
    if (newStatus === STATUS.COMPLETED || newStatus === STATUS.NON_COMPLIANT) {
      await alertService.create({
        sampleId:    id,
        barcode:     sample.barcode,
        productName: sample.productName,
        type:        newStatus === STATUS.NON_COMPLIANT ? 'critical' : 'info',
        message:     newStatus === STATUS.NON_COMPLIANT
          ? `Namuna "${sample.barcode}" nomuvofiq deb topildi!`
          : `Namuna "${sample.barcode}" barcha sinovlardan o'tdi`,
        isRead: false,
      });
    }

    return { oldStatus, newStatus };
  },

  async transfer(id, toLabId, employeeId, note = '') {
    const sample = await sampleService.get(id);
    if (!sample) throw new Error('Namuna topilmadi');

    const oldLabId = sample.currentLabId;
    const labsVisited = [...(sample.labsVisited || [])];
    if (!labsVisited.includes(toLabId)) labsVisited.push(toLabId);

    await updateDoc(doc(db, 'samples', id), {
      currentLabId:  toLabId,
      currentStatus: STATUS.RECEIVED,
      labsVisited,
      updatedAt: serverTimestamp(),
    });

    await historyService.add({
      sampleId:   id,
      labId:      toLabId,
      oldStatus:  sample.currentStatus,
      newStatus:  STATUS.RECEIVED,
      employeeId,
      note:       note || `${oldLabId} laboratoriyasidan ko'chirildi`,
      isTransfer: true,
      fromLabId:  oldLabId,
      toLabId,
    });

    // Update load counts
    if (oldLabId) await labService.incrementLoad(oldLabId, -1);
    await labService.incrementLoad(toLabId, 1);

    // Alert
    await alertService.create({
      sampleId: id,
      barcode:  sample.barcode,
      productName: sample.productName,
      type: 'info',
      message: `Namuna "${sample.barcode}" yangi laboratoriyaga ko'chirildi`,
      isRead: false,
    });
  },

  async delete(id) {
    await deleteDoc(doc(db, 'samples', id));
  },

  subscribeToAll(cb, { labId } = {}) {
    let q = query(collection(db, 'samples'), orderBy('updatedAt', 'desc'));
    if (labId) q = query(collection(db, 'samples'), where('currentLabId', '==', labId), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },

  subscribeToOne(id, cb) {
    return onSnapshot(doc(db, 'samples', id), snap => {
      if (snap.exists()) cb({ id: snap.id, ...snap.data() });
    });
  },

  async getOverdue(hours = 48) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const snap = await getDocs(
      query(
        collection(db, 'samples'),
        where('currentStatus', 'in', [STATUS.RECEIVED, STATUS.WAITING, STATUS.TESTING])
      )
    );
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(s => s.updatedAt?.toDate() < cutoff);
  },

  async getStats() {
    const snap = await getDocs(collection(db, 'samples'));
    const all = snap.docs.map(d => d.data());
    const stats = {};
    Object.values(STATUS).forEach(s => { stats[s] = 0; });
    all.forEach(s => { if (stats[s.currentStatus] !== undefined) stats[s.currentStatus]++; });
    stats.total = all.length;
    return stats;
  },
};

// ═══════════════════════════════════════════════════════════════
// HISTORY SERVICE
// ═══════════════════════════════════════════════════════════════
export const historyService = {
  async add(data) {
    return addDoc(collection(db, 'sampleHistory'), {
      ...data,
      timestamp: serverTimestamp(),
    });
  },

  async getBySample(sampleId) {
    const snap = await getDocs(
      query(
        collection(db, 'sampleHistory'),
        where('sampleId', '==', sampleId),
        orderBy('timestamp', 'asc')
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getByLab(labId, limitCount = 50) {
    const snap = await getDocs(
      query(
        collection(db, 'sampleHistory'),
        where('labId', '==', labId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  subscribeToRecent(cb, limitCount = 20) {
    return onSnapshot(
      query(
        collection(db, 'sampleHistory'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      ),
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },
};

// ═══════════════════════════════════════════════════════════════
// ALERT SERVICE
// ═══════════════════════════════════════════════════════════════
export const alertService = {
  async create(data) {
    return addDoc(collection(db, 'alerts'), {
      ...data,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  },

  async getAll() {
    const snap = await getDocs(
      query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(50))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async markRead(id) {
    await updateDoc(doc(db, 'alerts', id), { isRead: true });
  },

  async markAllRead() {
    const snap = await getDocs(
      query(collection(db, 'alerts'), where('isRead', '==', false))
    );
    const updates = snap.docs.map(d => updateDoc(d.ref, { isRead: true }));
    await Promise.all(updates);
  },

  subscribeToUnread(cb) {
    return onSnapshot(
      query(
        collection(db, 'alerts'),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc'),
        limit(20)
      ),
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN SERVICE
// ═══════════════════════════════════════════════════════════════
export const adminService = {
  async getStats() {
    const [samplesStats, labsSnap, usersSnap] = await Promise.all([
      sampleService.getStats(),
      labService.getAll(),
      userService.getAll(),
    ]);
    return {
      ...samplesStats,
      totalLabs:  labsSnap.length,
      totalUsers: usersSnap.length,
    };
  },
};
