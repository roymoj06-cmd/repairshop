import { Box, Typography, Breadcrumbs as MuiBreadcrumbs } from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import { Link, useLocation } from 'react-router-dom'
import { FC } from 'react'

import { routesConfig } from '@/config/routes'

interface BreadcrumbItem {
  path: string
  title: string
}

const findRouteByPath = (
  path: string,
  routes: typeof routesConfig
): BreadcrumbItem[] => {
  const segments = path.split('/').filter(Boolean)
  let currentRoutes = routes
  const breadcrumbs: BreadcrumbItem[] = []

  for (const segment of segments) {
    const currentPath =
      '/' + segments.slice(0, segments.indexOf(segment) + 1).join('/')
    const route = currentRoutes.find((r) => r.path === currentPath)

    if (route) {
      breadcrumbs.push({
        path: route.path,
        title: route.title
      })

      if (route.children) {
        currentRoutes = route.children
      }
    }
  }

  return breadcrumbs
}

const Breadcrumb: FC = () => {
  const location = useLocation()
  const breadcrumbs = findRouteByPath(location.pathname, routesConfig)

  if (breadcrumbs.length <= 1) return null

  return (
    <Box className='breadcrumb-container'>
      <MuiBreadcrumbs
        separator={<NavigateBeforeIcon fontSize='small' />}
        aria-label='breadcrumb'
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <Box key={crumb.path} className='breadcrumb-item'>
              {isLast ? (
                <Typography
                  color='text.primary'
                  className='breadcrumb-text active'
                >
                  {crumb.title}
                </Typography>
              ) : (
                <Link to={crumb.path} className='breadcrumb-link'>
                  <Typography
                    color='text.secondary'
                    className='breadcrumb-text'
                  >
                    {crumb.title}
                  </Typography>
                </Link>
              )}
            </Box>
          )
        })}
      </MuiBreadcrumbs>
    </Box>
  )
}

export default Breadcrumb
