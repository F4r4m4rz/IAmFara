import { BookOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import { Link, Outlet } from 'react-router-dom';
import {
  Logo,
  StyledContent,
  StyledHeader,
  StyledMenu,
} from './LayoutShell.Styles';

export function LayoutShell() {
  return (
    <Layout>
      <StyledHeader>
        <Link to={'/'}>
          <Logo src="/icon.png" alt="icon" />
        </Link>
        <StyledMenu mode="horizontal" items={menuItems} />
      </StyledHeader>
      <StyledContent>
        <Outlet />
      </StyledContent>
    </Layout>
  );
}

const menuItems: ItemType<MenuItemType>[] = [
  {
    key: 'about',
    icon: <UserOutlined />,
    title: 'About Me',
    label: 'About Me',
  },
  {
    key: 'blog',
    icon: <BookOutlined />,
    title: 'Blog',
    label: 'Blog',
  },
  {
    key: 'contact',
    icon: <MessageOutlined />,
    title: 'Contact Me',
    label: 'Contact Me',
  },
];
