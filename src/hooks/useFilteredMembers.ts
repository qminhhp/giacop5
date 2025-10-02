import { useAuth } from '@/contexts/AuthContext';
import { MEMBERS, Member } from '@/types';

// IDs of members to hide when using basic password
const RESTRICTED_MEMBER_IDS = ['1', '2', '12']; // Vũ Huy Điệp, Vũ Quang Minh, Lê Trung Kiên

export const useFilteredMembers = (): Member[] => {
  const { authLevel } = useAuth();

  if (authLevel === 'basic') {
    // Filter out restricted members for basic auth
    return MEMBERS.filter(member => !RESTRICTED_MEMBER_IDS.includes(member.id));
  }

  // Return all members for full auth
  return MEMBERS;
};