import React from 'react';

const ContainerSettingContext = React.createContext(
    {
        hiddenSilderBtn: true, useOldRoute: false
    });

export default ContainerSettingContext;