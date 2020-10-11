import React from 'react'

export class UserViewer extends React.Component{


  render(){
    let urlTerm = 'NOEP'
    try{
      urlTerm=this.props.match.params.username
    }catch{
      console.log("NOPe")
      urlTerm = "catch"
    }
    
    return <p>User view {urlTerm}</p>
  }
}


export class TripViewer extends React.Component{



  render(){
    return(
      <p>Trip view</p>
    )
  }
}