import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatPathName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="w-full px-4 py-4 text-sm">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="text-gray-500 hover:text-primary-600 transition-colors"
          >
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={name} className="flex items-center">
              <FiChevronRight className="text-gray-400 mx-2" />
              {isLast ? (
                <span className="text-primary-600 font-medium">
                  {formatPathName(name)}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {formatPathName(name)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
