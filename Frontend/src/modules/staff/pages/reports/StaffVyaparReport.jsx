import React from 'react';
import VyaparReport from '../../../../common/components/reports/VyaparReport';
import { useStaffAuth } from '../../context/StaffAuthContext';

const StaffVyaparReport = () => {
    const { staffUser } = useStaffAuth();
    return <VyaparReport token={staffUser?.token} />;
};

export default StaffVyaparReport;
