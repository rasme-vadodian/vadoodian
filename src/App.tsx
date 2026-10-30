import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { GlobalModeBar } from './components/common/GlobalModeBar';

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

const MainAppContent: React.FC = () => {
  const { mode, adminView, waiterView, customerView, toast } = useApp();

  return (
    <div className="min-h-screen bg-[#FFF8F4] flex flex-col font-sans">
      {/* Universal Mode Switcher & Quick Navigation */}
      <GlobalModeBar />

      {/* Dynamic Screen Renderer */}
      <div className="flex-1 flex flex-col">
        {mode === 'admin' && (
          adminView === 'admin_login' ? (
            <AdminLogin />
          ) : (
            <AdminLayout>
              {adminView === 'live_tables' && <LiveTablesMonitoring />}
              {adminView === 'orders_list' && <OrdersList />}
              {adminView === 'order_detail' && <OrderDetailView />}
              {adminView === 'menu_management' && <MenuManagement />}
              {adminView === 'product_edit' && <ProductEditForm />}
              {adminView === 'staff_performance' && <StaffPerformance />}
            </AdminLayout>
          )
        )}

        {mode === 'waiter' && (
          <>
            {waiterView === 'waiter_login' && <WaiterPinLogin />}
            {waiterView === 'waiter_workspace' && <WaiterWorkspace />}
            {waiterView === 'waiter_ordering' && <WaiterOrderTaking />}
            <WaiterProfileModal />
          </>
        )}

        {mode === 'customer' && (
          <>
            {customerView === 'customer_menu' && <CustomerMenu />}
            {customerView === 'customer_quick_grid' && <CustomerQuickGrid />}
            {customerView === 'customer_item_detail' && <CustomerItemDetail />}
          </>
        )}
      </div>

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
