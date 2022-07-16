function Text(props) {
  const {
    config
  } = props;

  return (
    <div className="text">
      <div className="text-title">{config.title}</div>
      <div className="text-message">{config.message}</div>
    </div>
  );
}

export default Text;
