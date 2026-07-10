import { FilterGoLoader } from './tenantLoaders/filterGoLoader';
import { SignalLoader } from './tenantLoaders/signalLoader';

export default {
  'Filter-Go': {
    name: 'Filter-Go',
    brandColor: '#2DA550',
    domains: ['filter-go.com', 'localhost'],
    logo: 'https://signalassets.blob.core.windows.net/filtergo/filter-go-logo.png',
    loader: FilterGoLoader,
    sliderData: [
      {
        id: 1,
        imageUrl: 'https://signalassets.blob.core.windows.net/filtergo/filter-go-slide1.png',
        title: 'Take control of your team',
        desc: 'Keep your team connected, organized, and productive on the go.',
      },
      {
        id: 2,
        imageUrl: 'https://signalassets.blob.core.windows.net/filtergo/filter-go-slide2.png',
        title: 'Take control of your team',
        desc: 'Gain complete control and visibility over your Sales Managers and interns within the web portal.',
      },
      {
        id: 3,
        imageUrl: 'https://signalassets.blob.core.windows.net/filtergo/filter-go-slide3.png',
        title: 'Manage tasks with efficiency',
        desc: 'Improve productivity with efficient task management and streamlined workflows.',
      },
    ],
  },
  'Team-Signal': {
    name: 'Signal',
    brandColor: '#146DFF',
    domains: ['teamsignal.com', 'localhost', 'azurestaticapps.net'],
    logo: 'https://signalassets.blob.core.windows.net/signal/assets/signalLogo.svg',
    loader: SignalLoader,
    sliderData: [
      {
        id: 1,
        imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/Mask-group.png',
        title: 'Take control of your sales team',
        desc: 'Gain complete control and visibility over your Sales Managers and interns within the web portal.',
      },
      {
        id: 2,
        imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/signal2-1.png',
        title: 'Manage tasks with efficiency',
        desc: 'Assign leads in bulk to the sales people who meet the necessary job requirements, and view their activity.',
      },
      {
        id: 3,
        imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/signal1-1.png',
        title: 'Real-time insights and analytics',
        desc: 'Real-time statistics, empowering you to identify status, optimize operations, and drive sales rationally.',
      },
    ],
  },
};
