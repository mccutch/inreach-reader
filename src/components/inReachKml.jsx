import React from 'react'
import {apiFetch} from '../helperFunctions'
import * as urls from '../urls'
import {today, TimeInputButton} from './dateFunctions.jsx'
import {StandardModal} from './reactComponents.jsx'


export function parseInReachData(apiData){
  if(!apiData.is_valid || !apiData.placemarks){
    return null
  }
  let points = []
  let paths = []

  for(let i in apiData.placemarks){
    let p = apiData.placemarks[i]
    let geo = p.geometry
    console.log("i", typeof i)

    if(geo.type==="Point"){
      points.push({
        description:p.extendedData["Time UTC"],
        label:(parseInt(i)+1).toString(),
        position:{lng:geo.coords[0][0],lat:geo.coords[0][1]},
        readOnly:true,
      })
    }else if(geo.type==="LineString"){
      let path = []
      for(let j in geo.coords){
        path.push({lng:geo.coords[j][0],lat:geo.coords[j][1]})
      }
      paths.push({
        name:p.description,
        colour:"#000000",
        path:path,
        readOnly:true,
      })
    }else{
      console.log(geo)
    }
  }
  return({points:points, paths:paths})
}


export class InreachSetupModal extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      isValid:false,
      tested:false,
      ID_input:this.props.user.profile.mapshare_ID,
    }
    this.handleChange=this.handleChange.bind(this)
    this.testInput=this.testInput.bind(this)
    this.saveChanges=this.saveChanges.bind(this)
    this.checkBeforeClose=this.checkBeforeClose.bind(this)
  }

  testInput(){
    console.log(this.state.ID_input)
    getKMLData({
      mapshareID:this.state.ID_input,
      onSuccess:(json)=>(this.setState({
        isValid:true, 
        tested:true,
        successMessage:"Mapshare ID received a valid response from Garmin services."
      })),
      onFailure:(err)=>(this.setState({
        isValid:false, 
        tested:true,
        errorMessage:"Unable to verify Mapshare ID with Garmin services."
      })),
    })
  }

  handleChange(e){
    this.setState({ID_input:e.target.value, isValid:false, tested:false,})
  }

  saveChanges(mapshare_ID){
    apiFetch({
      method:'PATCH',
      url:`${urls.PROFILE}/${this.props.user.profile.id}/`,
      data:{mapshare_ID:mapshare_ID},
      onSuccess:()=>{console.log("grouse"); this.props.app.refresh(); this.props.app.hideModal();},
      onFailure:()=>{console.log("fuck")},
    })
  }

  checkBeforeClose(){
    this.props.app.hideModal()
  }

  render(){
    let title = <div>inReach Feed Setup</div>
    let mapshare_ID = this.props.user.profile.mapshare_ID
    let body = 
      <div>
        <p>Mapshare ID:</p>
        
        <input
          type="text"
          defaultValue={this.props.user.profile.mapshare_ID}
          onChange={this.handleChange}
          placeholder={this.props.placeholder}
          maxLength={this.props.maxLength}
          className={`form-control my-2 ${this.state.isValid ? "is-valid":""} ${this.state.tested&&!this.state.isValid ? "is-invalid":""}`}
        />
        <small className={`${!this.state.isValid ? "invalid-feedback":"valid-feedback"}`}>
          {this.state.tested ?
            <div>{!this.state.isValid ? `${this.state.errorMessage}`:`${this.state.successMessage}`}</div>
            :
            ""
          }
        </small>


        {!this.state.isValid && <button className="btn btn-success btn-disabled" onClick={this.testInput}>Test</button>}

      </div>

      let footer = 
        <div>
          {this.state.isValid && <button className="btn btn-success m-2" onClick={()=>this.saveChanges(this.state.ID_input)}>Save changes</button>}
          {this.props.user.profile.mapshare_ID && <button className="btn btn-outline-danger m-2" onClick={()=>this.saveChanges("")}>Remove inReach link</button>}
        </div>

    return(
      <StandardModal title={title} body={body} footer={footer} hideModal={this.checkBeforeClose}/>
    )
  }
}

export function getKMLData({mapshareID, startDate, endDate, onSuccess, onFailure}){
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
      if(json.is_valid){
        onSuccess(json)
      } else{
        onFailure(json)
      }
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
          <button className="btn btn-success" onClick={
            ()=>getKMLData({
              mapshareID:this.state.mapshareID, 
              startDate:this.state.startDate, 
              endDate:this.state.endDate,
              onSuccess:(json)=>{console.log(json)},
              onFailure:(err)=>{console.log(err)},
            })
          }>Find</button>
        </div>
      </div>
    )
  }
}