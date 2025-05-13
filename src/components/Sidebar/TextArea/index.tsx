interface TextAreaChange {
  value: string; 
  name: string;
}
interface Props {
  name: string;
  value?: string | number;
  label: string;
  rows?: number;
  mask?: string;
  size?: 'half' | 'full'
  onChange: (values: TextAreaChange) => void;
}

export default function TextArea({
name,
value,
label,
rows = 2,
size = 'full',
onChange
}: Props) {
  const classNameGroup = `input-material__area input-material__area--${size}`;

  const onChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      value: e.target.value,
      name: name,
    })
  }

  return (
  <div  className={classNameGroup}>
      <div className='input-material__label'><label htmlFor={name}>{label}</label></div>
      <div className='flex input-material__group'>
        <textarea 
          id={name}
          className='input-material__field'
          rows={rows}
          value={value}
          onChange={onChangeInput}
        />
      </div>
    </div>
  )
}