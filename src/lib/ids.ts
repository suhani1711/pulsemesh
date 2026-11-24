/**
 * Generates an honest unique ID formatted PM-YYMMDD-XXXX
 */
export function generateSosId(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 4 random alphanumeric characters (excluding confusing chars like 0, O, 1, I)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `PM-${year}${month}${day}-${rand}`;
}

export function generateMessageId(): string {
  return 'msg_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

export function generatePeerId(): string {
  return 'peer_' + Math.random().toString(36).substring(2, 9);
}
