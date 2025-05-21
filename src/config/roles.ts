export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    TECHNICIAN = 'TECHNICIAN',
    WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
    SALESMAN = 'SALESMAN',
    ADMIN = 'ADMIN'
  }
  
  export interface MenuItem {
    title: string
    path: string
    icon: string
    roles: UserRole[]
    children?: MenuItem[]
  }
  
  export const menuItems: MenuItem[] = [
    {
      title: 'داشبورد',
      path: '/dashboard',
      icon: 'dashboard',
      roles: [
        UserRole.ADMIN,
        UserRole.TECHNICIAN,
        UserRole.WAREHOUSE_MANAGER,
        UserRole.SALESMAN
      ]
    },
    {
      title: 'مشتریان',
      path: '/customers',
      icon: 'people',
      roles: [
        UserRole.ADMIN,
        UserRole.SALESMAN
      ]
    },
    {
      title: 'خودروها',
      path: '/vehicles',
      icon: 'directions_car',
      roles: [
        UserRole.ADMIN,
        UserRole.TECHNICIAN,
        UserRole.SALESMAN
      ]
    },
    {
      title: 'تعمیرات',
      path: '/repairs',
      icon: 'build',
      roles: [
        UserRole.ADMIN,
        UserRole.TECHNICIAN
      ]
    },
    {
      title: 'انبار',
      path: '/warehouse',
      icon: 'inventory',
      roles: [
        UserRole.ADMIN,
        UserRole.WAREHOUSE_MANAGER
      ],
      children: [
        {
          title: 'موجودی',
          path: '/warehouse/inventory',
          icon: 'inventory_2',
          roles: [
            UserRole.ADMIN,
            UserRole.WAREHOUSE_MANAGER
          ]
        },
        {
          title: 'درخواست‌ها',
          path: '/warehouse/requests',
          icon: 'request_quote',
          roles: [
            UserRole.ADMIN,
            UserRole.WAREHOUSE_MANAGER
          ]
        }
      ]
    },
    {
      title: 'فروش',
      path: '/sales',
      icon: 'shopping_cart',
      roles: [
        UserRole.ADMIN,
        UserRole.SALESMAN
      ]
    },
    {
      title: 'گزارشات',
      path: '/reports',
      icon: 'assessment',
      roles: [
        UserRole.ADMIN
      ]
    },
    {
      title: 'تنظیمات',
      path: '/settings',
      icon: 'settings',
      roles: [
        UserRole.ADMIN
      ]
    }
  ]