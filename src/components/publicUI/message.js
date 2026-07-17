
import React, { startTransition, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { CheckOutlined, ExclamationOutlined, InfoOutlined, CloseOutline, CloseFilled, CloseOutlined, CloseCircleFilled } from '@ant-design/icons';

const colors = {
    success: '#52c41a',
    warning: '#faad14',
    info: '#1890ff',
    error: '#f5222d'
};

const IconWrapper = ({ children, color }) => (
    <div style={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: color,
        borderRadius: '50%',
        padding: '2px'
    }}>
        {children}
    </div>
);

const icons = {
    success: <IconWrapper color={colors.success}><CheckOutlined style={{ color: 'white' }} /></IconWrapper>,
    warning: <IconWrapper color={colors.warning}><ExclamationOutlined style={{ color: 'white' }} /></IconWrapper>,
    info: <IconWrapper color={colors.info}><InfoOutlined style={{ color: 'white' }} /></IconWrapper>,
    error: <IconWrapper color={colors.error}><CloseOutlined style={{ color: 'white' }} /></IconWrapper>
};
let messageCount = 0;

const Message = ({ type, text }) => {
    const [visible, setVisible] = useState(true);
    const color = colors[type];
    const icon = React.cloneElement(icons[type], { style: { color: 'white', backgroundColor: color, borderRadius: '50%' } });

    if (!visible) return null;

    return (
        <div style={{
            backgroundColor: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.22)`,
            padding: '10px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            position: 'fixed',
            top: `${10 + messageCount * 50}px`,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: '80%',
            maxWidth: '400px'
        }}>
            <span style={{ marginRight: '10px' }}>{icon}</span>
            <span style={{ flex: 1 }}>{text}</span>
            <CloseCircleFilled style={{ marginLeft: '10px', cursor: 'pointer', color: 'white', backgroundColor: colors[type], borderRadius: '50%' }} onClick={() => setVisible(false)} />
        </div>
    );
};

const showMessage = (type, text) => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const root = ReactDOM.createRoot(div);
    startTransition(() => {
        root.render(<Message type={type} text={text} />);
    });

    messageCount++;

    setTimeout(() => {
        startTransition(() => {
            root.unmount();
        });
        document.body.removeChild(div);
        messageCount--;
    }, 3000);
};

export const success = (text) => showMessage('success', text);
export const warning = (text) => showMessage('warning', text);
export const info = (text) => showMessage('info', text);
export const error = (text) => showMessage('error', text);

