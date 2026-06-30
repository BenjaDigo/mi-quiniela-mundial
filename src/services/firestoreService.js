import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc,
  onSnapshot, query, where, orderBy, serverTimestamp, deleteDoc,
  arrayUnion, arrayRemove, writeBatch, increment
} from 'firebase/firestore'
import { db } from '../firebase/config'

// ── Quinielas ──────────────────────────────────────────────────────────────

export async function createQuiniela(quinielaId, data) {
  await setDoc(doc(db, 'quinielas', quinielaId), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'draft',
  })
}

export async function getQuiniela(id) {
  const snap = await getDoc(doc(db, 'quinielas', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getAllQuinielas() {
  const snap = await getDocs(collection(db, 'quinielas'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getMyQuinielas(uid) {
  const snap = await getDocs(query(collection(db, 'quinielas'), where('adminUid', '==', uid)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function listenQuiniela(id, cb) {
  return onSnapshot(doc(db, 'quinielas', id), snap => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function updateQuiniela(id, data) {
  await updateDoc(doc(db, 'quinielas', id), data)
}

export async function deleteQuiniela(quinielaId) {
  const participantsSnap = await getDocs(collection(db, 'quinielas', quinielaId, 'participants'))
  const batch = writeBatch(db)
  participantsSnap.docs.forEach(d => batch.delete(d.ref))
  batch.delete(doc(db, 'quinielas', quinielaId))
  await batch.commit()
}

// ── Participantes ──────────────────────────────────────────────────────────

export async function joinQuiniela(quinielaId, user) {
  const batch = writeBatch(db)
  batch.set(
    doc(db, 'quinielas', quinielaId, 'participants', user.uid),
    { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL ?? null, teams: [], points: 0, joinedAt: serverTimestamp() }
  )
  batch.set(doc(db, 'users', user.uid), { activeQuinielaId: quinielaId }, { merge: true })
  await batch.commit()
}

export async function getActiveQuinielaId(uid) {
  const profile = await getUserProfile(uid)
  if (profile?.activeQuinielaId) return profile.activeQuinielaId
  const qs = await getMyQuinielas(uid)
  return qs[0]?.id ?? null
}

export function listenActiveQuinielaId(uid, cb) {
  return onSnapshot(doc(db, 'users', uid), snap => {
    cb(snap.exists() ? (snap.data()?.activeQuinielaId ?? null) : null)
  })
}

export async function getParticipants(quinielaId) {
  const snap = await getDocs(collection(db, 'quinielas', quinielaId, 'participants'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function listenParticipants(quinielaId, cb) {
  return onSnapshot(
    query(collection(db, 'quinielas', quinielaId, 'participants'), orderBy('points', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function assignTeamsToParticipants(quinielaId, assignment) {
  const batch = writeBatch(db)
  for (const [uid, teams] of Object.entries(assignment)) {
    batch.update(doc(db, 'quinielas', quinielaId, 'participants', uid), { teams })
  }
  await batch.commit()
}

export async function resetParticipantTeams(quinielaId, participantUids) {
  const batch = writeBatch(db)
  for (const uid of participantUids) {
    batch.update(doc(db, 'quinielas', quinielaId, 'participants', uid), {
      teams: [],
      extrasBought: 0,
    })
  }
  await batch.commit()
}

export async function updateParticipantPoints(quinielaId, uid, points) {
  await updateDoc(doc(db, 'quinielas', quinielaId, 'participants', uid), { points })
}

// ── Partidos (cache local en Firestore) ───────────────────────────────────

export async function saveMatches(matches) {
  const batch = writeBatch(db)
  for (const m of matches) {
    batch.set(doc(db, 'matches', String(m.id)), m)
  }
  await batch.commit()
}

export async function updateDisabledTeams(quinielaId, codes) {
  await updateDoc(doc(db, 'quinielas', quinielaId), { disabledTeams: codes })
}

export function listenMatches(cb) {
  return onSnapshot(collection(db, 'matches'), snap => {
    cb(snap.docs.map(d => d.data()))
  })
}

// ── Perfil de usuario ─────────────────────────────────────────────────────

export async function markParticipantPaid(quinielaId, uid, paid) {
  await updateDoc(doc(db, 'quinielas', quinielaId, 'participants', uid), { paid })
}

export async function assignExtraTeam(quinielaId, uid, extraTeams) {
  if (!extraTeams?.length) return null
  const idx      = Math.floor(Math.random() * extraTeams.length)
  const teamCode = extraTeams[idx]
  const remaining = extraTeams.filter((_, i) => i !== idx)
  const batch = writeBatch(db)
  batch.update(doc(db, 'quinielas', quinielaId), { extraTeams: remaining })
  batch.update(doc(db, 'quinielas', quinielaId, 'participants', uid), {
    teams: arrayUnion(teamCode),
    extrasBought: increment(1),
  })
  await batch.commit()
  return teamCode
}

export async function setShareBuddy(quinielaId, uid, buddy) {
  await updateDoc(doc(db, 'quinielas', quinielaId, 'participants', uid), {
    shareBuddy: buddy ?? null,
  })
}

export async function getUserTeams(uid) {
  const qs = await getAllQuinielas()
  const snaps = await Promise.all(
    qs.map(q => getDoc(doc(db, 'quinielas', q.id, 'participants', uid)))
  )
  const teams = []
  for (const snap of snaps) {
    if (snap.exists()) teams.push(...(snap.data().teams ?? []))
  }
  return [...new Set(teams)]
}

export async function syncParticipantPhoto(quinielaId, uid, photoURL) {
  if (!photoURL) return
  await updateDoc(doc(db, 'quinielas', quinielaId, 'participants', uid), { photoURL })
}

export async function saveUserProfile(uid, profile) {
  await setDoc(doc(db, 'users', uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}
