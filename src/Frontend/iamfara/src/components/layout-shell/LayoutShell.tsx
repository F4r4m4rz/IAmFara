import { BookOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Logo,
  StyledContent,
  StyledHeader,
  StyledMenu,
} from './LayoutShell.Styles';

export function LayoutShell() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout>
      <StyledHeader>
        <Link to={'/'}>
          <Logo src="/icon.png" alt="icon" />
        </Link>
        <StyledMenu
          mode="horizontal"
          items={menuItems(navigate)}
          selectedKeys={[location.pathname]}
        />
      </StyledHeader>
      <StyledContent>
        <Outlet />
      </StyledContent>
    </Layout>
  );
}

const menuItems: (
  navigate: (url: string) => void
) => ItemType<MenuItemType>[] = (navigate) => [
  {
    key: '/about',
    icon: <UserOutlined />,
    title: 'About Me',
    label: 'About Me',
    onClick: () => navigate('/about'),
  },
  {
    key: '/blog',
    icon: <BookOutlined />,
    title: 'Blog',
    label: 'Blog',
    onClick: () => navigate('/blog'),
  },
  {
    key: '/contact',
    icon: <MessageOutlined />,
    title: 'Contact Me',
    label: 'Contact Me',
    onClick: () => navigate('/contact'),
  },
];
