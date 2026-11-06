import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { GlobalModeBar } from './components/common/GlobalModeBar';
import { LandingPage } from './components/common/LandingPage';

// Admin Views
import { AdminLayout } from './components/admin/AdminLayout';
import { LiveTablesMonitoring } from './components/admin/LiveTablesMonitoring';
import { OrdersList } from './components/admin/OrdersList';
import { OrderDetailView } from './components/admin/OrderDetailView';
import { MenuManagement } from './components/admin/MenuManagement';
import { ProductEditForm } from './components/admin/ProductEditForm';
import { StaffPerformance } from './components/admin/StaffPerformance';
import { AdminLogin } from './components/admin/AdminLogin';

// Waiter Views
import { WaiterPinLogin } from './components/waiter/WaiterPinLogin';
import { WaiterWorkspace } from './components/waiter/WaiterWorkspace';
import { WaiterOrderTaking } from './components/waiter/WaiterOrderTaking';
import { WaiterProfileModal } from './components/waiter/WaiterProfileModal';

// Customer Views
import { CustomerMenu } from './components/customer/CustomerMenu';
import { CustomerQuickGrid } from './components/customer/CustomerQuickGrid';
import { CustomerItemDetail } from './components/customer/CustomerItemDetail';

/** نوار تغییر نقش فقط در محیط توسعه و با ?demo=1 فعال می‌شود. */
const demoBarEnabled = (): boolean => {
  if (!import.meta.env.DEV) return false;
  return new URLSearchParams(window.location.search).get('demo') === '1';
};

const ScreenLoading: React.FC<{ label: string }> = ({ label }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FFF8F4] text-[#002252]">
    <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
    <p className="font-bold text-lg">{label}</p>
  </div>
);

const CustomerGate: React.FC = () => {
  const {
    customerView,
    customerLoading,
    customerError,
    customerSession,
    retryCustomerSession,
    navigate,
  } = useApp();

  if (customerError) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#FFF8F4] px-6 text-center">
        <span className="material-symbols-outlined text-5xl text-[#BD8655]">qr_code_2</span>
        <h1 className="text-2xl font-bold text-[#002252]">دسترسی به میز ممکن نشد</h1>
        <p className="text-sm text-[#6E6B67] max-w-sm leading-relaxed">{customerError}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={retryCustomerSession}
            className="px-5 py-2.5 rounded-xl bg-[#002252] text-white font-bold cursor-pointer hover:bg-[#00377B]"
          >
            تلاش دوباره
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#EADBCE] text-[#002252] font-bold cursor-pointer"
          >
            صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  if (customerLoading || !customerSession) {
    return <ScreenLoading label="در حال باز کردن میز..." />;
  }

  return (
    <>
      {customerView === 'customer_menu' && <CustomerMenu />}
      {customerView === 'customer_quick_grid' && <CustomerQuickGrid />}
      {customerView === 'customer_item_detail' && <CustomerItemDetail />}
    </>
  );
};

const MainAppContent: React.FC = () => {
  const {
    mode,
    adminView,
    adminAuthLoading,
    adminSession,
    waiterView,
    waiterAuthLoading,
    waiterSession,
    toast,
  } = useApp();

  const content = (() => {
    if (mode === 'home') {
      return <LandingPage />;
    }

    if (mode === 'admin') {
      if (adminAuthLoading) return <ScreenLoading label="بررسی نشست مدیریت..." />;
      if (!adminSession || adminView === 'admin_login') return <AdminLogin />;
      return (
        <AdminLayout>
          {adminView === 'live_tables' && <LiveTablesMonitoring />}
          {adminView === 'orders_list' && <OrdersList />}
          {adminView === 'order_detail' && <OrderDetailView />}
          {adminView === 'menu_management' && <MenuManagement />}
          {adminView === 'product_edit' && <ProductEditForm />}
          {adminView === 'staff_performance' && <StaffPerformance />}
        </AdminLayout>
      );
    }

    if (mode === 'waiter') {
      if (waiterAuthLoading) return <ScreenLoading label="بررسی نشست مهماندار..." />;
      if (!waiterSession || waiterView === 'waiter_login') return <WaiterPinLogin />;
      return (
        <>
          {waiterView === 'waiter_workspace' && <WaiterWorkspace />}
          {waiterView === 'waiter_ordering' && <WaiterOrderTaking />}
          <WaiterProfileModal />
        </>
      );
    }

    if (mode === 'customer') {
      return <CustomerGate />;
    }

    return <LandingPage />;
  })();

  return (
    <div className="min-h-screen bg-[#FFF8F4] flex flex-col font-sans">
      {demoBarEnabled() && <GlobalModeBar />}

      <div className="flex-1 flex flex-col">{content}</div>

      {/* Global Interactive Toast Notification */}
      {toast && (
        <div className="fixed top-12 left-4 right-4 max-w-sm mx-auto z-50 bg-[#002252] text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#BD8655] animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-9 h-9 rounded-full bg-[#BD8655] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">notifications_active</span>
          </div>
          <div className="flex-1 text-sm">
            <p className="font-bold text-base text-[#FFDCC1]">{toast.title}</p>
            <p className="text-white/80 text-xs mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
