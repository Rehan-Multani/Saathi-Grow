import React from 'react';
import VyaparReport from '../../../../common/components/reports/VyaparReport';
import { useStoreManagerAuth } from '../../context/StoreManagerAuthContext';

const ManagerVyaparReport = () => {
    const { managerUser } = useStoreManagerAuth();
    return <VyaparReport token={managerUser?.token} />;
};

export default ManagerVyaparReport;
