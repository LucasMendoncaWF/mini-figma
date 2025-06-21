import leftIcon from '../../../assets/images/text-left.svg';
import rightIcon from '../../../assets/images/text-right.svg';
import centerIcon from '../../../assets/images/text-center.svg';
import justifyIcon from '../../../assets/images/text-justify.svg';
import './Alignment.scss';
import { ChangeValues } from '../Input';

interface Props {
  value?: string;
  onChange: (values: ChangeValues) => void;
}

export default function Alignment({onChange, value}: Props) {
  
  const positions = [
    ['left', leftIcon],
    ['center',  centerIcon],
    ['right', rightIcon],
    ['justify', justifyIcon]
  ];

  
  return (
    <div className="flex alignment-style">
      {positions.map(position => 
        <button key={position[0]} className={value === position[0] ? 'selected' : ''} onClick={() => onChange({value: position[0], name: 'textAlign'})}><img src={position[1]} alt={position[0]}/></button>
      )}
    </div>
  )
}
