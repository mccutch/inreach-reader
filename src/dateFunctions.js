import React from 'react';
import {StandardModal} from './reactComponents.js';


// Format as string for html input
export function formatDate(date){
  let obj = new Date(date)
  let dd = String(obj.getDate()).padStart(2, '0')
  let mm = String(obj.getMonth()+1).padStart(2, '0');
  let yyyy = obj.getFullYear();
  return `${yyyy}-${mm}-${dd}`
}
export function formatTime(value){
  let obj = new Date(value)
  let hrs = String(obj.getHours()).padStart(2, '0');
  let min = String(obj.getMinutes()).padStart(2, '0');
  return `${hrs}:${min}`
}

// Format visible to user
export function displayTime(dt){
  return dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
}
export function displayDate(dt){
  return dt.toDateString()
}


export function today({addDays=0, roundToMins=false, setHour=false}){
  let dateTime = new Date()

  if(addDays){
    dateTime.setDate(dateTime.getDate()+addDays)
  }
  if(setHour){
    dateTime.setHours(setHour)
    dateTime.setMinutes(0)
  }
  if(roundToMins){
    dateTime=roundToNMinutes(dateTime, roundToMins)
  }
  return dateTime
}

function roundToNMinutes(dateTime, n){
  if(60%n!==0) return dateTime;
  let mins = dateTime.getMinutes()
  let q = n
  console.log(Math.floor(mins/q))
  let shouldRoundUp = (mins%q <= q/2.0) ? 0 : 1
  let roundedMins = q*Math.floor(mins/q) + shouldRoundUp*q
  dateTime.setMinutes(roundedMins)
  return dateTime
}




export class TimeInputButton extends React.Component{
  constructor(props){
    super(props)

    this.editDateTime=this.editDateTime.bind(this)
  }

  editDateTime(event){
    this.props.app.setModal(
      <TimeInputModal 
        title={this.props.label}
        defaultDate={formatDate(this.props.value)} 
        defaultTime={formatTime(this.props.value)}
        returnDateTime={this.props.returnDateTime}
        app={this.props.app} 
      />
    )
  }

  render(){
    return(
      <button className={`btn text-left text-light ${this.props.className}`} onClick={this.editDateTime}>
       {this.props.label}: <em>{displayDate(this.props.value)}, {displayTime(this.props.value)}</em>
      </button>           
    )
  }
}


export class TimeInputModal extends React.Component{
  constructor(props){
    super(props)
    this.state={
      date:this.props.defaultDate,
      time:this.props.defaultTime,
    }
    this.returnDateTime=this.returnDateTime.bind(this)
    this.handleChange=this.handleChange.bind(this)
  }

  handleChange(event){
    console.log(event.target.name)
    console.log(event.target.value)
    this.setState({[event.target.name]:event.target.value})
  }

  returnDateTime(){
    let D = this.state.date.split(/\D/);
    let T = this.state.time.split(/\D/);
    console.log(D)
    console.log(T)
    let newDate = new Date(D[0],D[1]-1,D[2],T[0],T[1])
    console.log(newDate)
    this.props.returnDateTime(newDate)
    this.props.app.hideModal()
  }

  render(){
    let title=<div>{this.props.title}</div>
    let body = 
      <form className="form-row">
        <div className="col-6">
          <input className="form-control my-2" type="date" name="date" defaultValue={this.props.defaultDate} onChange={this.handleChange}/>
        </div>
        <div className="col-6">
          <input className="form-control my-2" type="time" name="time" defaultValue={this.props.defaultTime} onChange={this.handleChange}/>
        </div>
      </form>

    let footer = <button className="btn btn-block btn-success" onClick={this.returnDateTime}>Continue</button>  
    return <StandardModal title={title} body={body} footer={footer} hideModal={this.props.app.hideModal}/>
  }
}


