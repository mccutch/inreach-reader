import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';
import {Link} from 'react-router-dom';

function IconButton({isActive, activeStyle, inactiveStyle, onClick, icon, size}){
  return(
    <button className={`btn ${isActive?activeStyle:inactiveStyle} btn-block`} onClick={onClick}>
      <img alt="" src={icon} width={size?size:"30"} />
    </button>
  )
}
IconButton.propTypes = {
  isActive: PropTypes.bool,
  activeStyle: PropTypes.string,
  inactiveStyle: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.string,
  size: PropTypes.string,
}

function WarningModal({body, warnings, hideModal, onContinue}){
  console.log(warnings)
  let title = <div>Are you sure?</div>
  let modalBody = body ?
    body
    :
    <div>
      <p>The following warnings were found:</p>
      {warnings.map((text, index) => <p key={index}>- {text}</p>)}
    </div>

  let footer = 
    <div>
      <button className="btn btn-outline-danger m-2" onClick={hideModal}>Cancel</button>
      <button className="btn btn-outline-success m-2" onClick={onContinue}>Continue</button>
    </div>
  return <StandardModal title={title} body={modalBody} footer={footer} hideModal={hideModal} headerClass="bg-warning text-dark"/>
}
WarningModal.propTypes = {
  body: PropTypes.element,
  warnings: PropTypes.element,
  hideModal: PropTypes.func,
  onContinue: PropTypes.func,
}

function PendingBtn({name, onClick, className, pending, disabled, children}){
  let inactive = pending||disabled
  return <button name={name} onClick={inactive?()=>{}:onClick} className={`btn ${className} ${inactive?"disabled":""}`} >{children}</button>
}
PendingBtn.propTypes = {
  name: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  pending: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
}

function CenterPage({children}){
  return <div className='container-sm my-2 bg-light' style={{maxWidth:"600px"}}>{children}</div>
}
CenterPage.propTypes = {
  children: PropTypes.element,
}

function CleanLink({to, className, onClick, children}){
  return <Link to={to} className={className} style={{textDecoration:'none'}} onClick={onClick}>{children}</Link>
}
CleanLink.propTypes = {
  to: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.string,
}

function NavButton({to, className, children}){
  return( 
    <CleanLink to={to} >
      <button className={className}>
      {children}
      </button>
    </CleanLink>  
  )
}
NavButton.propTypes = {
  to: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.element,
}



function VerticalSpacer({height}){
  return(
    <div>
      <div className="col" style={{height:`${height?height:3}rem`}}></div>
    </div>
  )    
}
VerticalSpacer.propTypes = {
  height: PropTypes.node,
}

function LabelledInput({className, prepend, append}){
  return(
    <div className={className}>
    <div className="input-group">
      {this.props.prepend ?
        <div className="input-group-prepend">
          <span className="input-group-text"> {prepend} </span>
        </div>
        : ""
      }
      {this.props.input}
      {this.props.append ?
        <div className="input-group-append">
          <span className="input-group-text"> {append} </span>
        </div>
        : ""
      }
    </div>
    </div>
  )
}
LabelledInput.propTypes = {
  className: PropTypes.string,
  prepend: PropTypes.node,
  append: PropTypes.node,
}

function StandardModal({title, body, footer, headerClass, hideModal}){
    return(
      <Modal show={true} onHide={hideModal}>
        <Modal.Header className={headerClass ? headerClass : "bg-teal text-light"} closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        {body && <Modal.Body>{body}</Modal.Body>}
        {footer && <Modal.Footer>{footer}</Modal.Footer>}
      </Modal>
    )
}
StandardModal.propTypes = {
  title: PropTypes.node,
  body: PropTypes.node,
  footer: PropTypes.node,
  headerClass: PropTypes.string,
  hideModal: PropTypes.func,
}


function FormRow({labelWidth, label, input, helpText, }){
  let labelClass = `col-${labelWidth} col-form-label`
  let inputClass = `col-${12-labelWidth}`
  return(
    <div className="form-group form-row">
      <div className={labelClass}>{label}</div>
      <div className={inputClass}>
        {input}
      </div>
      {helpText ? <small className="form-text text-muted mx-2">{helpText}</small> : ""}
    </div>
  )
}
FormRow.propTypes = {
  labelWidth: PropTypes.number,
  label: PropTypes.string,
  input: PropTypes.node,
  helpText: PropTypes.string,
}


export class TabbedDisplay extends React.Component{
  /*
  this.props.tabData = [
    {
      label:<tab label 1>,
      display:<tab display 1>,
    },
    {
      label:<tab label 2>,
      display:<tab display 2>,
    },
    ...
  ]
  */

  constructor(props){
    super(props)

    this.state={
      activeTab:"0",
    }

    this.makeTab=this.makeTab.bind(this)
    this.makeTabNavBar=this.makeTabNavBar.bind(this)
    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    console.log(event.target.name)
    this.setState({
      activeTab:event.target.name
    })
  }

  makeTab(tabIndex, label){
    console.log(tabIndex)
    console.log(label)
    return(
      <strong><button name={tabIndex} className={`nav-link ${this.state.activeTab===tabIndex?"active bg-light border-dark":""}`} onClick={this.handleClick}>
        {label}
      </button></strong>
    )
  }

  makeTabNavBar(){
    let tabData = this.props.tabData
    let navBar = []
    for(let i in tabData){
      navBar.push(<li className="nav-item">{this.makeTab(i.toString(), tabData[i].label)}</li>)
    }
    return navBar
  }

  render(){
    let activeTab = parseInt(this.state.activeTab)
    let display = this.props.tabData[activeTab].display


    return(
      <div>
        <ul className="nav nav-tabs border-dark" style={{margin:"0.5rem 0rem 0rem 0rem"}}>
          {this.makeTabNavBar()}
        </ul>
        {display}
      </div>
    )
  }
}
TabbedDisplay.propTypes = {
  tabData: PropTypes.array,
}




function ObjectSelectionList({list, key, label, value, id, name, onChange, defaultValue, labelFunc}){
  let selections = list;
  let listOptions = [];
  for(let i=0; i<selections.length; i++){
    listOptions.push(
      <option 
        value={selections[i][value]}
        key = {key ? selections[i][key] : i}
      >
        {labelFunc ? labelFunc(selections[i]) : selections[i][label]}
      </option>
    )
  }
  return (
    <select
      id = {id}
      name = {name}
      onChange = {onChange}
      defaultValue = {defaultValue}
      className="form-control my-2"
    >
      {listOptions}
    </select>
  )
}
ObjectSelectionList.propTypes = 
{
    list: PropTypes.array, 
    key: PropTypes.node, 
    label: PropTypes.node, 
    value: PropTypes.string, 
    id: PropTypes.node,
    name: PropTypes.string, 
    onChange: PropTypes.func, 
    defaultValue: PropTypes.node, 
    labelFunc: PropTypes.func,
}


//Exports
export {
  IconButton, 
  WarningModal,
  PendingBtn,
  CenterPage,
  CleanLink,
  NavButton,
  VerticalSpacer,
  LabelledInput,
  StandardModal,
  FormRow,
  ObjectSelectionList,
}
