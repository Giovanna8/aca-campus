var React = require('react');
var ReactDOM = require('react-dom');
require('react.backbone');
var LocationModalComponent = React.createFactory(require('./LocationModalComponent'));

module.exports = React.createBackboneClass({
  locationModal: function() {
    ReactDOM.unmountComponentAtNode($('#modal-container')[0]);
    ReactDOM.render(LocationModalComponent({
      terms: this.props.terms,
      collection: this.getCollection(),
      model: this.getModel()
    }), $('#modal-container')[0]);
    $('#location-modal').modal('open');
    Materialize.updateTextFields();
  },

  deleteLocation: function() {
    this.getModel().destroy({
      wait: true
    });
  },

  render: function() {
    return (
      <tr>
        <td>{this.getModel().fullAddress()}</td>
        <td>{this.getModel().get('phone')}</td>
        <td>{this.getModel().get('contact')}</td>
        <td>{this.getModel().get('note')}</td>
        <td>
          <a className="waves-effect waves-teal btn-flat" onClick={this.locationModal}>
            <i className="material-icons">mode_edit</i>
          </a>
        </td>
      </tr>
    );
  }
});
