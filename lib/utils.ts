import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Status workflow event (internal PO & Kemahasiswaan)
export type EventApprovalStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'approved'
  | 'rejected'
  | 'pending_approval';

// Status registrasi mahasiswa (yang ditampilkan ke mahasiswa)
export type RegistrationStatus = 
  | 'registered'       // terdaftar
  | 'already_registered' // sudah daftar sebelumnya
  | 'full'             // kuota penuh
  | 'closed'           // pendaftaran ditutup
  | 'cancelled';       // event dibatalkan

export interface StudentStatusInfo {
  label: string;
  color: string;
  badgeClass: string;
}

export function getRegistrationLabel(status: RegistrationStatus): StudentStatusInfo {
  switch (status) {
    case 'registered':
      return { 
        label: 'Terdaftar', 
        color: 'green',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold'
      };
    case 'already_registered':
      return { 
        label: 'Sudah Terdaftar', 
        color: 'amber',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-250 font-bold'
      };
    case 'full':
      return { 
        label: 'Kuota Penuh', 
        color: 'red',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-250 font-bold'
      };
    case 'closed':
      return { 
        label: 'Pendaftaran Ditutup', 
        color: 'gray',
        badgeClass: 'bg-stone-50 text-stone-500 border border-stone-250 font-bold'
      };
    case 'cancelled':
      return { 
        label: 'Event Dibatalkan', 
        color: 'red',
        badgeClass: 'bg-red-50 text-red-700 border border-red-250 font-bold'
      };
    default:
      return { 
        label: 'Terdaftar', 
        color: 'green',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold'
      };
  }
}

/**
 * Determines the clean student/public-facing registration status of an event
 * based on its general data and whether the specific user has joined it.
 */
export function getStudentEventStatus(
  eventStatus: string,
  hasJoined: boolean,
  pesertaCount: number,
  maxQuota: number
): RegistrationStatus {
  if (hasJoined) {
    return 'registered';
  }

  const lowerStatus = eventStatus.toLowerCase();
  if (lowerStatus === 'rejected' || lowerStatus === 'cancelled' || lowerStatus === 'dibatalkan') {
    return 'cancelled';
  }

  const internalStatuses = [
    'pending approval',
    'pending_approval',
    'draft',
    'submitted',
    'under review',
    'under_review',
    'revision requested',
    'revision_requested',
    'rejected',
    'tutup',
    'closed',
    'selesai'
  ];

  if (internalStatuses.includes(lowerStatus)) {
    return 'closed';
  }

  if (pesertaCount >= maxQuota) {
    return 'full';
  }

  // Otherwise fallback (e.g. if open but user hasn't registered yet, we don't return 'registered',
  // but if we are just checking registration status specifically, it maps to closed or we handle it on page)
  return 'closed';
}

// A robust cn class list merger for Tailwind CSS v4 setup
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (e) {
    return dateString;
  }
}

export function formatTimeDiff(timestamp: string): string {
  try {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  } catch (e) {
    return "";
  }
}
