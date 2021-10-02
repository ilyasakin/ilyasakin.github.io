interface Props {
  title: string;
}

const SectionTitle: React.FC<Props> = ({ title }) => {
  return <h2 className="section-title">{title}</h2>;
};

export default SectionTitle;
