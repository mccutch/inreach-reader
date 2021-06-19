import React from 'react'
import {apiFetch} from './helperFunctions'
import * as urls from './urls'
import {today, TimeInputButton} from './dateFunctions'
import {StandardModal} from './reactComponents.js'

export class InreachSetupModal extends React.Component{
  constructor(props){
    super(props)
    this.state = {}
  }

  render(){
    let title = <div>inReach Feed Setup</div>
    let body = <p>Mapshare ID: {this.props.user.profile.mapshare_ID}</p>

    return(
      <StandardModal title={title} body={body} hideModal={this.props.app.hideModal}/>
    )
  }
}

export function getKMLData({mapshareID, startDate, endDate}){
  let suffix = mapshareID

  if(startDate){
    suffix+=`/d1=${startDate.toISOString()}`
  }
  if(startDate&&endDate){
    suffix+='&'
  }else if(endDate){
    suffix+='/'
  }
  if(endDate){
    suffix+=`d2=${endDate.toISOString()}`
  }

  console.log(`Suffix: ${suffix}`)

  apiFetch({
    url:`${urls.MAPSHARE}/${suffix}/`,
      method:"GET",
      onSuccess:(json)=>{
        console.log(json)
      },
      onFailure:(err)=>{
        console.log(err)
      },
    })
}

export class KMLDemo extends React.Component{
  constructor(props){
    super(props)
    this.state = {
    }
    this.handleChange=this.handleChange.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }


  render(){

    return(
      <div>
        <p>KML Demo</p>
        <div>
          <input name="mapshareID" type="text" placeholder="Mapshare ID" onChange={this.handleChange}/>
          <TimeInputButton
            label={"From"}
            value={today({addDays:-2000})}
            returnDateTime={(dt)=>this.setState({startDate:dt})}
            className="btn-info btn-block my-2"
            app={this.props.app}
          />
          <TimeInputButton
            label={"From"}
            value={today({})}
            returnDateTime={(dt)=>this.setState({endDate:dt})}
            className="btn-info btn-block my-2"
            app={this.props.app}
          />
          <button className="btn btn-success" onClick={()=>getKMLData({mapshareID:this.state.mapshareID, startDate:this.state.startDate, endDate:this.state.endDate})}>Find</button>
        </div>
      </div>
    )
  }
}