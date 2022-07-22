function Text(props) {
  const {
    config,
  } = props;

  return (
    <div className="text-message">{config.message}</div>
  );
}

export default Text;
