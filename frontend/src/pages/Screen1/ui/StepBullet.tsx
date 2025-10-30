import { createElement } from 'react';

type HeadingTag = 'h2' | 'h3' | 'h4';

interface StepBulletProps {
  heading: string;
  description: string;
  headingTag?: HeadingTag;
  className?: string;
  headingClassName?: string;
  descriptionClassName?: string;
}

export const StepBullet = ({
  heading,
  description,
  headingTag = 'h3',
  className = '',
  headingClassName = '',
  descriptionClassName = '',
}: StepBulletProps) => (
  <div className={className}>
    {createElement(headingTag, { className: headingClassName }, heading)}
    <p className={descriptionClassName}>{description}</p>
  </div>
);

export default StepBullet;
