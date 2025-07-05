import React from 'react';

const Settings: React.FC = () => {
  const settingsSections = [
    {
      title: 'Display Settings',
      items: [
        { title: 'Dashboard Sections', description: 'Customize the visibility of different sections on your dashboard.', button: 'Manage' },
        { title: 'Currency Preference', description: 'Choose your preferred currency for displaying asset values.', button: 'Change' },
      ]
    },
    {
      title: 'Account Management',
      items: [
        { title: 'Wallet Addresses', description: 'Manage your connected wallet addresses and their associated names.', button: 'Manage' },
        { title: 'Clear Data', description: 'Clear all application data stored in cookies.', button: 'Clear' },
      ]
    },
    {
      title: 'Other',
      items: [
        { title: 'Terms & Privacy', description: 'View the terms of service and privacy policy.', link: true },
        { title: 'About', description: 'Learn more about the application and its features.', link: true },
      ]
    }
  ];

  return (
    <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Settings</p>
      </div>
      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{section.title}</h2>
          {section.items.map((item, itemIndex) => {
            const isLink = 'link' in item;
            const isButton = 'button' in item;

            return (
              <div key={itemIndex} className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
                <div className="flex flex-col justify-center">
                  <p className="text-[#0d141c] text-base font-medium leading-normal line-clamp-1">{item.title}</p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal line-clamp-2">{item.description}</p>
                </div>
                <div className="shrink-0">
                  {isButton && (
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-fit">
                      <span className="truncate">{(item as any).button}</span>
                    </button>
                  )}
                  {isLink && (
                    <div className="text-[#0d141c] flex size-7 items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Settings;
