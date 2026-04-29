import React from 'react';
import VyaparReport from '../../../../common/components/reports/VyaparReport';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminVyaparReport = () => {
    const { adminUser } = useAdminAuth();
    return <VyaparReport token={adminUser?.token} />;
};

export default AdminVyaparReport;
