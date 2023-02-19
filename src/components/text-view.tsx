function TextView(props: { text: { title: string; message: string } }) {
  const { text } = props;

  return (
    <div className={`widget widget-text`}>
      <div className='widget-header'>
        <h4 className='widget-title'>
          <span>{text.title}</span>
        </h4>
      </div>

      <div className='widget-body'>
        <div className='text-message'>{text.message}</div>
      </div>
    </div>
  );
}

export default TextView;
