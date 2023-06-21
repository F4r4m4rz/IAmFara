import { BookOutlined, MessageOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMobile } from 'src/utils/mediaQueries';
import {
  StyledContent,
  StyledHeader,
  StyledLayout,
  StyledMenu,
} from './LayoutShell.Styles';

export function LayoutShell() {
  const isMobile = useMobile();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledLayout>
      <StyledHeader>
        <Link to={'/'}>
          <img className="logo" src="/icon.png" alt="icon" />
        </Link>
        <StyledMenu
          mode="horizontal"
          items={menuItems(navigate)}
          selectedKeys={[location.pathname]}
          overflowedIndicator={<MenuOutlined rev={undefined} />}
        />
      </StyledHeader>
      <StyledContent>
        <Outlet />
      </StyledContent>
    </StyledLayout>
  );
}

const menuItems: (
  navigate: (url: string) => void
) => ItemType<MenuItemType>[] = (navigate) => [
  {
    key: '/about',
    icon: <UserOutlined rev={undefined} />,
    title: 'About Me',
    label: 'About Me',
    onClick: () => navigate('/about'),
  },
  {
    key: '/blog',
    icon: <BookOutlined rev={undefined} />,
    title: 'Blog',
    label: 'Blog',
    onClick: () => navigate('/blog'),
  },
  {
    key: '/contact',
    icon: <MessageOutlined rev={undefined} />,
    title: 'Contact Me',
    label: 'Contact Me',
    onClick: () => navigate('/contact'),
  },
];
