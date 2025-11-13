// Allowed notification types (align with frontend NotificationType union)
const NotificationTypes = [
    'doc',
    'pdf',
    'dashboard',
    'resolucao',
    'comentario',
    'sistema',
    'planilha',
    'link',
];

function isValidNotificationType(t) {
    return NotificationTypes.includes(t);
}

module.exports = { NotificationTypes, isValidNotificationType };
