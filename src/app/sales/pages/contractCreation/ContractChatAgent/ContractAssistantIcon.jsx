import contractAssistantIconSrc from 'assets/svg/contractAssistantIcon.svg';
import PropTypes from 'prop-types';

const ContractAssistantIcon = ({ className }) => (
  <img src={contractAssistantIconSrc} className={className} alt="" aria-hidden="true" />
);

ContractAssistantIcon.propTypes = {
  className: PropTypes.string,
};

export default ContractAssistantIcon;
