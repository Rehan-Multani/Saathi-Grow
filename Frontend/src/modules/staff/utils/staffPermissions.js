/**
 * Check if staff has a required permission, including implied/alias grants.
 * e.g. MANAGE_ORDERS also grants VIEW_ORDERS for the orders menu.
 */
export const hasStaffPermission = (permissions, required) => {
    if (!required || required === 'VIEW_DASHBOARD') return true;

    const list = Array.isArray(permissions) ? permissions : [];
    if (list.includes(required)) return true;

    const impliedBy = {
        VIEW_ORDERS: ['MANAGE_ORDERS'],
        VIEW_PRODUCTS: ['MANAGE_PRODUCTS'],
    };

    return (impliedBy[required] || []).some((perm) => list.includes(perm));
};

export const staffHasAnyPermission = (permissions, requiredList = []) => {
    if (!requiredList.length) return true;
    return requiredList.some((perm) => hasStaffPermission(permissions, perm));
};
