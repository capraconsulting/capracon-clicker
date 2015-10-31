let React = require('react')
let ReactDOM = require('react-dom')

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			clientList: [],
			totalClicks: 0,
			recording: true
		}
	}

	componentDidMount() {
		var ws = new WebSocket('ws://localhost:8001')

		ws.onopen = event => {
			console.log('connection open')
			ws.send('hei')
		}

		ws.onmessage = event => {
			var message = JSON.parse(event.data)
			let clientList = this.state.clientList

			if (message.event == 'connection') {
				clientList.push({
					address: message.address,
					client: message.client,
					clicks: 0
				})
				this.setState({
					clientList
				})

				console.log('list', clientList)
			}

			if (message.event == 'disconnect') {
				// TODO
			}

			if (message.event == 'keychange') {
				if (!this.state.recording) {
					console.log('not recording')
					return
				}

				clientList = clientList.map(client => {
					if (client.address == message.address) {
						client.clicks++
					}
					return client
				})
				this.setState({
					totalClicks: this.state.totalClicks + 1,
					clientList
				})
			}

			console.log(message)
			this.forceUpdate()
		}
	}

	resetCounters() {
		let clientList = this.state.clientList.map(client => {
			client.clicks = 0
			return client
		})
		this.setState({
			clientList,
			totalClicks: 0
		})
	}

	playPause() {
		this.setState({
			recording: !this.state.recording
		})
	}

	render() {
		return (
			<div>
				<h1>Capracon</h1>
				<p>Antall klienter: {Object.keys(this.state.clientList).length}</p>
				<p>Antall trykk: {this.state.totalClicks}</p>

				<table>
					{this.state.clientList.map(client => (
						<tr>
							<td>{client.address}</td>
							<td>{client.client}</td>
							<td>{client.clicks}</td>
						</tr>
					))}
				</table>

				<button onClick={this.resetCounters.bind(this)}>reset</button>
				<button onClick={this.playPause.bind(this)}>{this.state.recording ? 'pause' : 'play'}</button>
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'))
