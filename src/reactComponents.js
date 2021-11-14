import React from 'react';
import {Modal} from 'react-bootstrap';
import {Link} from 'react-router-dom';

export function IconButton({isActive, active, inactive, onClick, icon, size}){
  return(
    <button className={`btn ${isActive?active:inactive} btn-block`} onClick={onClick}>
      <img alt="" src={icon} width={size?size:"30"} />
    </button>
  )
}

export function NewComponent(props){
  return(
    "fuck"
  )
}

export function WarningModal({body, warnings, hideModal, onContinue}){
  let title = <div>Are you sure?</div>
  let modalBody = body ?
    body
    :
    <div>
      <p>The following warnings were found:</p>
      {warnings}
    </div>

  let footer = 
    <div>
      <button className="btn btn-outline-danger m-2" onClick={hideModal}>Cancel</button>
      <button className="btn btn-outline-success m-2" onClick={onContinue}>Continue</button>
    </div>
  return <StandardModal title={title} body={modalBody} footer={footer} hideModal={hideModal} headerClass="bg-warning text-dark"/>
}

export function PendingBtn({name, onClick, className, pending, disabled, children}){
  let inactive = pending||disabled
  return <button name={name} onClick={inactive?()=>{}:onClick} className={`btn ${className} ${inactive?"disabled":""}`} >{children}</button>
}

export function CenterPage({children}){
  return <div className='container-sm my-2 bg-light' style={{maxWidth:"600px"}}>{children}</div>
}

export function CleanLink({to, className, onClick, children}){
  return <Link to={to} className={className} style={{textDecoration:'none'}} onClick={onClick}>{children}</Link>
}

export function NavButton({to, className, children}){
  return( 
    <CleanLink to={to} >
      <button className={className}>
      {children}
      </button>
    </CleanLink>  
  )
}

export function VerticalSpacer({height}){
  return(
    <div>
      <div className="col" style={{height:`${height?height:3}rem`}}>
      
      </div>
    </div>
  )    
}

export class LabelledInput extends React.Component{
  render(){
    return(
      <div className={this.props.className}>
      <div className="input-group">
        {this.props.prepend ?
          <div className="input-group-prepend">
            <span className="input-group-text"> {this.props.prepend} </span>
          </div>
          : ""
        }
        {this.props.input}
        {this.props.append ?
          <div className="input-group-append">
            <span className="input-group-text"> {this.props.append} </span>
          </div>
          : ""
        }
      </div>
      </div>
    )
  }
}

export function StandardModal({title, body, footer, headerClass, hideModal}){
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

export class FormRow extends React.Component{
  render(){
    let labelClass = `col-${this.props.labelWidth} col-form-label`
    let inputClass = `col-${12-this.props.labelWidth}`
    return(
      <div className="form-group form-row">
        <div className={labelClass}>{this.props.label}</div>
        <div className={inputClass}>
          {this.props.input}
        </div>
        {this.props.helpText ? <small className="form-text text-muted mx-2">{this.props.helpText}</small> : ""}
      </div>
    )
  }
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





export class ObjectSelectionList extends React.Component{
  render(){
      //props: list, key, label, value, id, name, onChange, defaultValue


      let list = this.props.list;
      let listOptions = [];
      for(let i=0; i<list.length; i++){
        let key = (this.props.key ? list[i][this.props.key] : i)

        listOptions.push(
          <option 
            value={list[i][this.props.value]}
            key = {key}
          >
            {this.props.labelFunc ? this.props.labelFunc(list[i]) : list[i][this.props.label]}
          </option>
        )
      }
      return (
        <select
          id = {this.props.name}
          name = {this.props.name}
          onChange = {this.props.onChange}
          defaultValue = {this.props.defaultValue}
          className="form-control my-2"
        >
          {listOptions}
        </select>
      )
  }
}