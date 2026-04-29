import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
  sendPasswordResetEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential,
  GoogleAuthProvider, signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore, collection, doc,
  getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where,
  orderBy, limit, onSnapshot,
  serverTimestamp, increment, startAfter,
  Timestamp,
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
const googleProvider = new GoogleAuthProvider();

// ─── CONSTANTS ────────────────────────────────────────────────
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
  oziq_ovqat:     'Oziq-ovqat',
  elektrotexnika: 'Elektrotexnika',
  qurilish:       'Qurilish',
  mashinasozlik:  'Mashinasozlik',
  polimer:        'Polimer-kimyo',
  yengil:         'Yengil sanoat',
  bolalar:        "Bolalar o'yinchoqlari",
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
    await userService.createProfile(cred.user.uid, { displayName, email, role, labId, provider: 'email' });
    return cred;
  },
  loginWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
  async loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const { user } = result;
    const existing = await userService.getProfile(user.uid);
    if (!existing) {
      await userService.createProfile(user.uid, {
        displayName: user.displayName || 'Foydalanuvchi',
        email: user.email,
        photoURL: user.photoURL || null,
        role: 'observer',
        labId: null,
        provider: 'google',
      });
    }
    return result;
  },
  async resetPassword(email) { await sendPasswordResetEmail(auth, email); },
  async changePassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user?.email) throw new Error('Foydalanuvchi topilmadi');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  },
  logout:       () => signOut(auth),
  onAuthChange: (cb) => onAuthStateChanged(auth, cb),
  currentUser:  () => auth.currentUser,
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
      photoURL: data.photoURL || null,
      phone: data.phone || '',
      provider: data.provider || 'email',
      isActive: true,
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
    if (data.displayName && auth.currentUser?.uid === uid) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }
  },
  async getAll() {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async setRole(uid, role, labId = null) {
    await updateDoc(doc(db, 'users', uid), { role, labId, updatedAt: serverTimestamp() });
  },
  async setActive(uid, isActive) {
    await updateDoc(doc(db, 'users', uid), { isActive, updatedAt: serverTimestamp() });
  },
  async delete(uid) { await deleteDoc(doc(db, 'users', uid)); },
  subscribeToAll(cb) {
    return onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },
  async getStats() {
    const snap = await getDocs(collection(db, 'users'));
    const all  = snap.docs.map(d => d.data());
    const byRole = {};
    Object.values(ROLES).forEach(r => { byRole[r] = 0; });
    all.forEach(u => { if (byRole[u.role] !== undefined) byRole[u.role]++; });
    return { total: all.length, active: all.filter(u => u.isActive !== false).length, byRole };
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
  async getActive() {
    const snap = await getDocs(
      query(collection(db, 'laboratories'), where('isActive', '==', true), orderBy('name'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async update(id, data) {
    await updateDoc(doc(db, 'laboratories', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id) { await deleteDoc(doc(db, 'laboratories', id)); },
  async setActive(id, isActive) {
    await updateDoc(doc(db, 'laboratories', id), { isActive, updatedAt: serverTimestamp() });
  },
  subscribeToAll(cb) {
    return onSnapshot(
      query(collection(db, 'laboratories'), orderBy('name')),
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },
  async incrementLoad(id, delta = 1) {
    await updateDoc(doc(db, 'laboratories', id), { currentLoad: increment(delta), updatedAt: serverTimestamp() });
  },
  async getLoadReport() {
    const labs = await labService.getAll();
    return labs.map(l => ({
      ...l,
      loadPct: Math.min(100, Math.round(((l.currentLoad || 0) / (l.capacity || 50)) * 100)),
    })).sort((a, b) => b.loadPct - a.loadPct);
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
    if (data.initialLabId) {
      await historyService.add({
        sampleId: ref.id,
        labId: data.initialLabId,
        oldStatus: null,
        newStatus: STATUS.RECEIVED,
        employeeId: createdBy,
        note: 'Namuna qabul qilindi',
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
    const q    = query(collection(db, 'samples'), where('barcode', '==', barcode), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  },
  async getAll({ labId, status, search, limitCount } = {}) {
    let q = query(collection(db, 'samples'), orderBy('updatedAt', 'desc'));
    if (labId)  q = query(collection(db, 'samples'), where('currentLabId', '==', labId), orderBy('updatedAt', 'desc'));
    if (status) q = query(collection(db, 'samples'), where('currentStatus', '==', status), orderBy('updatedAt', 'desc'));
    if (limitCount) q = query(q, limit(limitCount));
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
  async getPaginated({ labId, status, pageSize = 20, lastDoc = null } = {}) {
    let q = query(collection(db, 'samples'), orderBy('updatedAt', 'desc'), limit(pageSize));
    if (labId)   q = query(collection(db, 'samples'), where('currentLabId', '==', labId), orderBy('updatedAt', 'desc'), limit(pageSize));
    if (status)  q = query(collection(db, 'samples'), where('currentStatus', '==', status), orderBy('updatedAt', 'desc'), limit(pageSize));
    if (lastDoc) q = query(q, startAfter(lastDoc));
    const snap = await getDocs(q);
    return {
      samples: snap.docs.map(d => ({ id: d.id, ...d.data() })),
      lastDoc: snap.docs[snap.docs.length - 1] || null,
      hasMore: snap.docs.length === pageSize,
    };
  },
  async getByDateRange(from, to, { labId, status } = {}) {
    const fromTs = Timestamp.fromDate(new Date(from));
    const toTs   = Timestamp.fromDate(new Date(to));
    let q = query(
      collection(db, 'samples'),
      where('createdAt', '>=', fromTs),
      where('createdAt', '<=', toTs),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (labId)  results = results.filter(s => s.currentLabId === labId);
    if (status) results = results.filter(s => s.currentStatus === status);
    return results;
  },
  async updateStatus(id, newStatus, employeeId, labId, note = '') {
    const sample = await sampleService.get(id);
    if (!sample) throw new Error('Namuna topilmadi');
    const oldStatus = sample.currentStatus;
    await updateDoc(doc(db, 'samples', id), { currentStatus: newStatus, updatedAt: serverTimestamp() });
    await historyService.add({ sampleId: id, labId: labId || sample.currentLabId, oldStatus, newStatus, employeeId, note });
    if (newStatus === STATUS.COMPLETED || newStatus === STATUS.NON_COMPLIANT) {
      await alertService.create({
        sampleId: id,
        barcode: sample.barcode,
        productName: sample.productName,
        type: newStatus === STATUS.NON_COMPLIANT ? 'critical' : 'info',
        message: newStatus === STATUS.NON_COMPLIANT
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
      currentLabId: toLabId,
      currentStatus: STATUS.RECEIVED,
      labsVisited,
      updatedAt: serverTimestamp(),
    });
    await historyService.add({
      sampleId: id, labId: toLabId,
      oldStatus: sample.currentStatus, newStatus: STATUS.RECEIVED,
      employeeId, note: note || "Ko'chirildi",
      isTransfer: true, fromLabId: oldLabId, toLabId,
    });
    if (oldLabId) await labService.incrementLoad(oldLabId, -1);
    await labService.incrementLoad(toLabId, 1);
    await alertService.create({
      sampleId: id, barcode: sample.barcode, productName: sample.productName,
      type: 'info',
      message: `Namuna "${sample.barcode}" yangi laboratoriyaga ko'chirildi`,
      isRead: false,
    });
  },
  async batchUpdateStatus(ids, newStatus, employeeId, labId, note = '') {
    return Promise.allSettled(ids.map(id => sampleService.updateStatus(id, newStatus, employeeId, labId, note)));
  },
  async delete(id) { await deleteDoc(doc(db, 'samples', id)); },
  async batchDelete(ids) {
    return Promise.allSettled(ids.map(id => deleteDoc(doc(db, 'samples', id))));
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
    const snap   = await getDocs(
      query(collection(db, 'samples'),
        where('currentStatus', 'in', [STATUS.RECEIVED, STATUS.WAITING, STATUS.TESTING])
      )
    );
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(s => s.updatedAt?.toDate() < cutoff);
  },
  async getStats() {
    const snap = await getDocs(collection(db, 'samples'));
    const all  = snap.docs.map(d => d.data());
    const stats = { total: all.length };
    Object.values(STATUS).forEach(s => { stats[s] = 0; });
    all.forEach(s => { if (stats[s.currentStatus] !== undefined) stats[s.currentStatus]++; });
    const compliant    = stats[STATUS.COMPLIANT] + stats[STATUS.COMPLETED];
    const nonCompliant = stats[STATUS.NON_COMPLIANT];
    const processed    = compliant + nonCompliant;
    stats.complianceRate = processed > 0 ? Math.round((compliant / processed) * 100) : 0;
    stats.activeCount    = (stats[STATUS.RECEIVED] || 0) + (stats[STATUS.WAITING] || 0) + (stats[STATUS.TESTING] || 0);
    return stats;
  },
  async getMonthlyTrend(months = 6) {
    const result = [];
    const now    = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const from = Timestamp.fromDate(d);
      const toD  = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const to   = Timestamp.fromDate(toD);
      const snap = await getDocs(
        query(collection(db, 'samples'), where('createdAt', '>=', from), where('createdAt', '<=', to))
      );
      const all = snap.docs.map(d => d.data());
      result.push({
        month:       d.toLocaleString('uz-UZ', { month: 'short', year: '2-digit' }),
        total:       all.length,
        compliant:   all.filter(s => s.currentStatus === STATUS.COMPLIANT || s.currentStatus === STATUS.COMPLETED).length,
        nonCompliant:all.filter(s => s.currentStatus === STATUS.NON_COMPLIANT).length,
        active:      all.filter(s => [STATUS.RECEIVED, STATUS.WAITING, STATUS.TESTING].includes(s.currentStatus)).length,
      });
    }
    return result;
  },
  async getReportByLab() {
    const [labs, samplesSnap] = await Promise.all([
      labService.getAll(),
      getDocs(collection(db, 'samples')),
    ]);
    const all = samplesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    return labs.map(lab => {
      const current    = all.filter(s => s.currentLabId === lab.id);
      const compliant  = current.filter(s => s.currentStatus === STATUS.COMPLIANT || s.currentStatus === STATUS.COMPLETED).length;
      const nonCompliant = current.filter(s => s.currentStatus === STATUS.NON_COMPLIANT).length;
      const processed  = compliant + nonCompliant;
      return {
        ...lab,
        currentCount: current.length,
        compliant, nonCompliant,
        active: current.filter(s => [STATUS.RECEIVED, STATUS.WAITING, STATUS.TESTING].includes(s.currentStatus)).length,
        complianceRate: processed > 0 ? Math.round((compliant / processed) * 100) : 0,
        loadPct: Math.min(100, Math.round(((lab.currentLoad || 0) / (lab.capacity || 50)) * 100)),
      };
    });
  },
  async getReportByProductType() {
    const snap = await getDocs(collection(db, 'samples'));
    const all  = snap.docs.map(d => d.data());
    const map  = {};
    all.forEach(s => {
      const key = s.productType || 'Boshqa';
      if (!map[key]) map[key] = { type: key, total: 0, compliant: 0, nonCompliant: 0 };
      map[key].total++;
      if (s.currentStatus === STATUS.COMPLIANT || s.currentStatus === STATUS.COMPLETED) map[key].compliant++;
      if (s.currentStatus === STATUS.NON_COMPLIANT) map[key].nonCompliant++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  },
  async getTopApplicants(limitN = 10) {
    const snap = await getDocs(collection(db, 'samples'));
    const all  = snap.docs.map(d => d.data());
    const map  = {};
    all.forEach(s => {
      const key = s.applicantName || "Noma'lum";
      if (!map[key]) map[key] = { name: key, total: 0, compliant: 0 };
      map[key].total++;
      if (s.currentStatus === STATUS.COMPLIANT || s.currentStatus === STATUS.COMPLETED) map[key].compliant++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, limitN);
  },
};

// ═══════════════════════════════════════════════════════════════
// HISTORY SERVICE
// ═══════════════════════════════════════════════════════════════
export const historyService = {
  async add(data) {
    return addDoc(collection(db, 'sampleHistory'), { ...data, timestamp: serverTimestamp() });
  },
  async getBySample(sampleId) {
    const snap = await getDocs(
      query(collection(db, 'sampleHistory'),
        where('sampleId', '==', sampleId),
        orderBy('timestamp', 'asc')
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getActivityLog(limitCount = 100) {
    const snap = await getDocs(
      query(collection(db, 'sampleHistory'), orderBy('timestamp', 'desc'), limit(limitCount))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getEmployeeStats() {
    const snap = await getDocs(query(collection(db, 'sampleHistory'), orderBy('timestamp', 'desc')));
    const all  = snap.docs.map(d => d.data());
    const map  = {};
    all.forEach(h => {
      if (!h.employeeId) return;
      if (!map[h.employeeId]) map[h.employeeId] = { employeeId: h.employeeId, actions: 0, transfers: 0, lastAction: null };
      map[h.employeeId].actions++;
      if (h.isTransfer) map[h.employeeId].transfers++;
      if (!map[h.employeeId].lastAction) map[h.employeeId].lastAction = h.timestamp;
    });
    return Object.values(map).sort((a, b) => b.actions - a.actions);
  },
  subscribeToRecent(cb, limitCount = 20) {
    return onSnapshot(
      query(collection(db, 'sampleHistory'), orderBy('timestamp', 'desc'), limit(limitCount)),
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },
};

// ═══════════════════════════════════════════════════════════════
// ALERT SERVICE
// ═══════════════════════════════════════════════════════════════
export const alertService = {
  async create(data) {
    return addDoc(collection(db, 'alerts'), { ...data, isRead: false, createdAt: serverTimestamp() });
  },
  async getAll(limitCount = 100) {
    const snap = await getDocs(
      query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(limitCount))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getUnread() {
    const snap = await getDocs(
      query(collection(db, 'alerts'), where('isRead', '==', false), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async markRead(id) { await updateDoc(doc(db, 'alerts', id), { isRead: true }); },
  async markAllRead() {
    const snap = await getDocs(query(collection(db, 'alerts'), where('isRead', '==', false)));
    await Promise.all(snap.docs.map(d => updateDoc(d.ref, { isRead: true })));
  },
  async delete(id) { await deleteDoc(doc(db, 'alerts', id)); },
  async deleteAllRead() {
    const snap = await getDocs(query(collection(db, 'alerts'), where('isRead', '==', true)));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  },
  async getStats() {
    const snap = await getDocs(collection(db, 'alerts'));
    const all  = snap.docs.map(d => d.data());
    return {
      total:    all.length,
      unread:   all.filter(a => !a.isRead).length,
      critical: all.filter(a => a.type === 'critical').length,
    };
  },
  subscribeToUnread(cb) {
    return onSnapshot(
      query(collection(db, 'alerts'), where('isRead', '==', false), orderBy('createdAt', 'desc'), limit(20)),
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },
  subscribeToAll(cb, limitCount = 50) {
    return onSnapshot(
      query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(limitCount)),
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN SERVICE
// ═══════════════════════════════════════════════════════════════
export const adminService = {
  async getStats() {
    const [samplesStats, labsSnap, usersSnap, alertsStats] = await Promise.all([
      sampleService.getStats(),
      labService.getAll(),
      userService.getAll(),
      alertService.getStats(),
    ]);
    const activeLabs   = labsSnap.filter(l => l.isActive !== false).length;
    const overdueCount = (await sampleService.getOverdue(48)).length;
    return {
      ...samplesStats,
      totalLabs: labsSnap.length,
      activeLabs,
      totalUsers: usersSnap.length,
      activeUsers: usersSnap.filter(u => u.isActive !== false).length,
      overdueCount,
      criticalAlerts: alertsStats.critical,
      unreadAlerts: alertsStats.unread,
    };
  },
  async getFullReport() {
    const [stats, trend, byLab, byProduct, topApplicants, overdueList, employeeStats] = await Promise.all([
      adminService.getStats(),
      sampleService.getMonthlyTrend(6),
      sampleService.getReportByLab(),
      sampleService.getReportByProductType(),
      sampleService.getTopApplicants(10),
      sampleService.getOverdue(48),
      historyService.getEmployeeStats(),
    ]);
    return { generatedAt: new Date().toISOString(), stats, trend, byLab, byProduct, topApplicants, overdueList, employeeStats };
  },
};
