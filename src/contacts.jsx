import React from 'react'
import {StandardModal} from './reactComponents.js'
import * as validation from './validation.js'
import {MAX_LEN_NAME} from './constants.js'
import {apiFetch} from './helperFunctions.js'
import * as urls from './urls.js'

export class ViewContact extends React.Component{
  render(){
    let contact = this.props.contact

    let title = <div>{contact.first_name} {contact.last_name}</div>
    let body = 
      <div>
        <p>Email: {contact.email}</p>
        <p>Mobile: {contact.mobile}</p>
      </div>

    let footer = this.props.app.loggedIn ?
    <button 
      className="btn btn-success" 
      onClick={()=>{
        this.props.app.setModal(
          <EditContact contact={contact} user={this.props.user} app={this.props.app} />
        )
      }}
    >Edit
    </button>
    : 
    null

    return(
      <StandardModal title={title} body={body} footer={footer} hideModal={this.props.app.hideModal}/>
    )
  }
}

export class EditContact extends React.Component{
  constructor(props){
    super(props)
    
    let contact = this.props.contact
    this.state = contact ?
      {
        first_name:contact.first_name,
        last_name:contact.last_name,
        email:contact.email,
        mobile:contact.mobile,
        relationship:contact.relationship,

        submitted:false,
        validEmail:contact.email?true:false,
      } 
      : 
      {
        submitted:false,
        validEmail:false,
      }   

    this.handleChange=this.handleChange.bind(this)
    this.validateData=this.validateData.bind(this)
    this.returnError=this.returnError.bind(this)
    this.saveContact=this.saveContact.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  returnError(errorMessage){
    this.setState({
      errorMessage:errorMessage,
      submissionPending:false,
    })
  }

  validateData(){
    console.log("Validating data...")
    this.setState({
      errorMessage:"",
      submitted:true,
      submissionPending:true,
    })

    if(!this.state.first_name || !this.state.last_name){
      this.returnError("First and last name are required.")
      return
    }

    if(this.state.email && !this.state.validEmail){
      this.returnError(validation.EMAIL_ERR)
      return
    }

    this.saveContact()
  }

  saveContact(){
    let saveNew = this.props.contact ? false:true

    let contactFields = ['first_name', 'last_name', 'email', 'mobile', 'relationship']
    let contactData = {}
    for(let i in contactFields){
      let field = contactFields[i]
      if(this.state[field]){
        contactData[field]=this.state[field]
      }
    }
    apiFetch({
      url:saveNew ? urls.MY_EMG_CONTACTS : `${urls.EMG_CONTACT}/${this.props.contact.id}/`,
      method:saveNew ? 'POST' : 'PATCH',
      data:contactData,
      onFailure:(err)=>{
        console.log(err)
        this.returnError("Unable to save changes.")
      },
      onSuccess:(newContact)=>{
        this.props.app.refresh()
        if(this.props.onSuccess){
          this.props.onSuccess(newContact)
        }
        this.props.app.hideModal()
      }
    })

  }

  render(){
    let title=<div>Emergency Contact</div>


    let body = 
      <div>
        <input type="text" className="form-control my-2" name="first_name" maxLength={MAX_LEN_NAME} onChange={this.handleChange} defaultValue={this.state.first_name} placeholder="First Name"/>
        <input type="text" className="form-control my-2" name="last_name" maxLength={MAX_LEN_NAME} onChange={this.handleChange} defaultValue={this.state.last_name} placeholder="Last Name"/>
        <validation.EmailInput
          defaultValue={this.state.email}
          isValid={this.state.validEmail}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={(bool)=>{this.setState({validEmail:bool})}}
          className="my-2"
        />
        <input type="text" className="form-control my-2" name="mobile" maxLength={MAX_LEN_NAME} onChange={this.handleChange} defaultValue={this.state.mobile} placeholder="Mobile"/>
        <input type="text" className="form-control my-2" name="relationship" maxLength={MAX_LEN_NAME} onChange={this.handleChange} defaultValue={this.state.relationship} placeholder="Relationship"/> 
        <p><strong>{this.state.errorMessage}</strong></p>
      </div>


    let footer=
      <div>
        <button className='btn btn-outline-danger' onClick={this.props.app.hideModal}>Cancel</button>
        {/*this.props.contact && <button className='btn btn-outline-success' onClick={this.validateData}>Delete</button>*/}
        <button className={`btn btn-success m-2 ${this.state.submissionPending ? "disabled":""}`} onClick={this.validateData}>Save changes</button>
      </div>

    return(
      <StandardModal title={title} body={body} footer={footer} hideModal={this.props.app.hideModal}/>
    )
  }
    
  
}