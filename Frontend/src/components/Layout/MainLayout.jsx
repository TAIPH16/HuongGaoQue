import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, title, onSearch }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} onSearch={onSearch} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;

