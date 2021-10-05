import { PaginationProvider } from '../../context/pagination.context';

const CompoundProviders: React.FC = ({ children }) => {
  return <PaginationProvider initialValue={{ inView: 'landing' }}>{children}</PaginationProvider>;
};

export default CompoundProviders;
