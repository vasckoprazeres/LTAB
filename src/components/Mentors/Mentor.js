import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContentWrapper from "../SnackbarContentComponent/SnackbarContentComponent";
import { Redirect } from "react-router-dom";
import PhotoIcon from "../../images/baseline_photo.png";
import Grid from "@material-ui/core/Grid";
import * as R from "ramda";
import {
  writeMentorWithoutEmail,
  editMentor,
  deleteMentor
} from "../../firebase/operations";
import { validateString } from "../validity";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import DeleteIcon from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import listsData from "./Literals/listsData";
import programData from "../Literals/Literals";

const { program } = programData;

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    margin: "80px 0",
    minHeight: "80vh",
    [theme.breakpoints.up("sm")]: {
      margin: "90px 24px"
    }
  },
  sectionMargin: {
    marginTop: theme.spacing.unit * 6
  },
  formControl: {
    margin: "24px 0",
    minWidth: 250,
    [theme.breakpoints.up("sm")]: {
      width: 400
    }
  },

  textField: {
    [theme.breakpoints.up("xs")]: {
      width: 200
    },
    [theme.breakpoints.up("sm")]: {
      width: 400
    },
    [theme.breakpoints.up("md")]: {
      width: 450
    },

    [theme.breakpoints.between("sm", "md")]: {
      width: 250
    },
    [theme.breakpoints.only("lg")]: {
      width: 400
    }
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2
  },
  buttons: {
    marginTop: theme.spacing.unit * 6
  },
  picture: {
    width: 200,
    height: 200
  },
  card: {
    paddingBottom: "1%",

    [theme.breakpoints.up("xs")]: {
      marginTop: "0px"
    },
    [theme.breakpoints.up("sm")]: {
      marginTop: "5px"
    },
    [theme.breakpoints.up("md")]: {
      marginTop: "20px"
    },

    [theme.breakpoints.between("sm", "md")]: {
      marginTop: "15px"
    }
  }
});

const { states, specialties } = listsData;

class NewMentor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      nameError: "",
      specialty: "",
      specialtyError: "",
      mail: "",
      mailError: "",
      phone: "",
      location: "",
      locationError: "",
      linkedin: "",
      twitter: "",
      facebook: "",
      description: "",
      descriptionError: "",
      btnText: "Save",
      openSnackbarSaved: false,
      openSnackbarError: false,
      sectionError: "",
      picturePath: "",
      pictureBlob: "",
      returnMentor: false,
      available: false,
      pictureName: PhotoIcon,
      open: false,
      imageError: "",
      openSnackbarDeleted: false,
      mentorState: "Let's talk about business",
      stateCode: "",
      stateCodeError: ""
    };
  }

  /**
   * componentDidMount – sets in the state data to edit
   * @returns {void}
   */
  componentDidMount = () => {
    this.authUser = this.props.location.state.authUser;
    if (this.props.location.state.mentor) {
      const { mentor } = this.props.location.state;
      this.dataToEdit(mentor);
    }
  };

  /**
   * dataToEdit – sets the state with the parameters sent via url
   * @returns {void}
   *
   */
  dataToEdit = mentor => {
    const { key } = this.props.location.state;
    this.setState({
      name: mentor.name,
      specialty: mentor.specialty,
      mail: mentor.mail,
      phone: mentor.phone,
      location: mentor.location,
      linkedin: mentor.linkedin,
      twitter: mentor.twitter,
      facebook: mentor.facebook,
      description: mentor.description,
      btnText: "Save changes",
      key: key,
      pictureName: mentor.pictureName === "NA" ? PhotoIcon : mentor.pictureName,
      available: mentor.available,
      mentorState: mentor.mentorState,
      stateCode: mentor.stateCode
    });
  };

  /**
   * checkForErrors - sets an error if the section if there are required fields
   * without a value
   * @returns {void}
   */
  checkForErrors = () => {
    let response = false;
    const {
      nameError,
      locationError,
      descriptionError,
      specialtyError,
      stateCodeError,
      specialty,
      stateCode,
      location,
      name
    } = this.state;
    const errorMessages =
      nameError ||
      locationError ||
      descriptionError ||
      specialtyError ||
      stateCodeError;
    const values =
      specialty === "" || stateCode === "" || location === "" || name === "";
    if (errorMessages || values) {
      this.setState({
        openSnackbarError: true,
        sectionError: "The fields with * are required"
      });
      response = true;
    }
    return response;
  };

  /**
   * checkForNull - sets an error if the field is null
   * @returns {void}
   */
  checkForNull = event => {
    const name = event.target.name;
    const formControl = name + "Error";
    const value = event.target.value;
    this.setState({
      [formControl]: validateString(name, value)
    });
  };

  /**
   * handleChange – the handleChange sets the value selected in a select list
   * or a multiline text
   * @param {Object} the object name and event
   * @return {void}
   */
  handleChange = event => {
    const { target } = event;
    const { value, name } = target;
    this.setState({
      [name]: value
    });
  };

  /**
   * handleChangeCheck – the handleChangeCheck sets the value of mentor's availability
   * @param {Object} the object name and event
   * @return {void}
   */
  handleChangeCheck = event => {
    const { target } = event;
    this.setState({
      available: target.checked
    });
  };

  /**
   * handlePicture - Creates a Blob objects and send it as an argument to
   * createObjectURL method, then sets the values of pictureName and pictureBlob
   * in the state if the size of the file is equal or les than 8MB
   * @returns void
   */
  handlePicture = event => {
    const currentFile = new Blob(event.target.files, { type: "image/png" });
    const size = event.target.files[0].size / 1024 / 1024;
    size <= 8
      ? this.setState({
          pictureName: window.URL.createObjectURL(currentFile),
          pictureBlob: currentFile
        })
      : this.setState({
          sectionError: "The size of the image must be inferior to 8 MB.",
          imageError:
            "The size of the image must be inferior to 8 MB. This image will not be save, choose another.",
          openSnackbarError: true
        });
  };

  /**
   * getFirebasePayload - returns the data to send to Firebase
   * @returns {Object} the Firebase payload
   */
  getFirebasePayload() {
    return R.pick(
      [
        "name",
        "specialty",
        "mail",
        "phone",
        "location",
        "linkedin",
        "twitter",
        "facebook",
        "description",
        "pictureName",
        "available",
        "mentorState",
        "stateCode"
      ],
      this.state
    );
  }

  /**
   * handleSubmit - sends Firebase payload
   * @returns {void}
   */
  handleSubmit = e => {
    e.preventDefault();
    const key = this.state.key;
    if (!this.checkForErrors()) {
      !key
        ? writeMentorWithoutEmail(
            this.getFirebasePayload(),
            this.state.pictureBlob
          ).then(
            this.setState({
              openSnackbarSaved: true,
              sectionError: "",
              successMsg: "Mentor's information has been saved"
            })
          )
        : editMentor(
            this.getFirebasePayload(),
            key,
            this.state.pictureBlob
          ).then(
            this.setState({
              openSnackbarSaved: true,
              successMsg: "Mentor's information has been modified",
              sectionError: ""
            })
          );
    }
  };

  /**
   * handleSnackbarClose - sets the actions when the snackbar is closed
   * @param {Object} event the event object
   * @param {Object} reason for closing the snackbar
   * @return {void}
   */
  handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.state.openSnackbarSaved
      ? this.setState({
          openSnackbarSaved: false,
          returnMentor: true
        })
      : this.state.openSnackbarDeleted
      ? this.setState({
          openSnackbarDeleted: false,
          returnMentor: true
        })
      : this.setState({ openSnackbarError: false });
  };

  handleDeleteMentor = () => {
    const { key } = this.state;
    deleteMentor(key).then(this.setState({ openSnackbarDeleted: true }));
    this.handleClose();
  };

  handleClickDeleteMentor = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };
  render() {
    const { classes } = this.props;
    const {
      name,
      specialty,
      mail,
      phone,
      location,
      linkedin,
      twitter,
      facebook,
      description,
      btnText,
      openSnackbarSaved,
      openSnackbarError,
      sectionError,
      pictureName,
      returnMentor,
      nameError,
      specialtyError,
      locationError,
      descriptionError,
      available,
      open,
      imageError,
      key,
      openSnackbarDeleted,
      mentorState,
      stateCode,
      stateCodeError
    } = this.state;

    return (
      <div className={classes.root}>
        {returnMentor && (
          <Redirect
            to={{
              pathname: "/mentors",
              state: { from: this.props.location }
            }}
          />
        )}
        <Card className={classes.card}>
          <form onSubmit={this.handleSubmit}>
            <CardContent>
              <Grid container spacing={24}>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <div className={classes.sectionMargin}>
                    <Typography variant="h6" color="primary">
                      Mentor's information
                    </Typography>
                  </div>
                  <div>
                    <img
                      src={pictureName}
                      alt="mentor photography"
                      className={classes.picture}
                    />

                    <input
                      type="file"
                      id="picture"
                      name="picture"
                      accept=".jpg, .jpeg, .png"
                      onChange={this.handlePicture}
                    />
                    {imageError ? (
                      <FormHelperText error={true}>{imageError}</FormHelperText>
                    ) : (
                      (pictureName === "NA" || pictureName === PhotoIcon) && (
                        <FormHelperText>
                          Please upload an image inferior to 8MB.
                        </FormHelperText>
                      )
                    )}
                  </div>
                  <div>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="name"
                        name="name"
                        label="Name"
                        value={name}
                        onChange={this.handleChange}
                        className={classes.textField}
                        onBlur={this.checkForNull}
                        margin="normal"
                        required
                      />
                      <FormHelperText error={true}>{nameError}</FormHelperText>
                    </FormControl>
                  </div>
                  <div>
                    <FormHelperText>Specialty/Industry * </FormHelperText>
                    <FormControl required className={classes.formControl}>
                      <Select
                        value={specialty}
                        label="Specialty"
                        onChange={this.handleChange}
                        onBlur={this.checkForNull}
                        name="specialty"
                        id="specialty"
                        displayEmpty
                        required
                        className={classes.textField}
                      >
                        <MenuItem value="" disabled>
                          Select the specialty
                        </MenuItem>
                        {specialties.map(specialty => (
                          <MenuItem key={specialty} value={specialty}>
                            {specialty}
                          </MenuItem>
                        ))}
                      </Select>

                      <FormHelperText error={true}>
                        {specialtyError}
                      </FormHelperText>
                    </FormControl>
                  </div>
                  <div>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="description"
                        name="description"
                        label="Description (professional abstract)"
                        multiline
                        rowsMax="15"
                        rows="10"
                        value={description}
                        onBlur={this.checkForNull}
                        onChange={this.handleChange}
                        className={classes.textField}
                        margin="normal"
                        required
                      />
                    </FormControl>
                    <FormHelperText error={true}>
                      {descriptionError}
                    </FormHelperText>
                  </div>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <div>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="location"
                        name="location"
                        label="City"
                        placeholder="e.g. New Bedford"
                        value={location}
                        onBlur={this.checkForNull}
                        onChange={this.handleChange}
                        className={classes.textField}
                        margin="normal"
                        required
                      />
                    </FormControl>
                    <FormHelperText error={true}>
                      {locationError}
                    </FormHelperText>
                  </div>
                  <div>
                    <FormHelperText>Country * </FormHelperText>

                    <FormControl required className={classes.formControl}>
                      <Select
                        value={stateCode}
                        label="State"
                        onChange={this.handleChange}
                        onBlur={this.checkForNull}
                        name="stateCode"
                        id="stateCode"
                        displayEmpty
                        required
                        className={classes.textField}
                      >
                        <MenuItem value="" disabled>
                          Select the Country
                        </MenuItem>
                        {states.map(state => (
                          <MenuItem key={state.code} value={state.code}>
                            {state.stateName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormHelperText error={true}>
                      {stateCodeError}
                    </FormHelperText>
                  </div>

                  <div>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="mail"
                        name="mail"
                        label="Mail"
                        type="email"
                        placeholder="e.g. mentor@email.com"
                        value={mail}
                        onChange={this.handleChange}
                        className={classes.textField}
                        margin="normal"
                      />
                    </FormControl>
                  </div>
                  <div>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="phone"
                        name="phone"
                        label="Phone"
                        placeholder="(nnn) nnn-nnnn "
                        value={phone}
                        onChange={this.handleChange}
                        className={classes.textField}
                        margin="normal"
                      />
                    </FormControl>
                  </div>
                  <div>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="linkedin"
                        name="linkedin"
                        label="Linkedin"
                        placeholder="https://www.linkedin.com/in/mentors-profile/"
                        value={linkedin}
                        onChange={this.handleChange}
                        className={classes.textField}
                        margin="normal"
                      />
                    </FormControl>
                    <FormHelperText>
                      e.g. https://www.linkedin.com/in/your-profile
                    </FormHelperText>
                  </div>
                  <div>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="twitter"
                        name="twitter"
                        label="Twitter"
                        placeholder="https://twitter.com/mentors_user"
                        value={twitter}
                        onChange={this.handleChange}
                        className={classes.textField}
                        margin="normal"
                      />
                    </FormControl>
                    <FormHelperText>
                      e.g. https://twitter.com/your_user
                    </FormHelperText>
                  </div>
                  <div>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="facebook"
                        name="facebook"
                        label="Facebook"
                        placeholder="https://www.facebook.com/mentors_profile"
                        value={facebook}
                        onChange={this.handleChange}
                        className={classes.textField}
                        margin="normal"
                      />
                    </FormControl>
                    <FormHelperText>
                      e.g. https://www.facebook.com/your_profile
                    </FormHelperText>
                  </div>
                  <div>
                    <br />
                    <Typography variant="body2" color="primary">
                      A message to share with {program.name} community
                    </Typography>
                    <FormControl required className={classes.formControl}>
                      <TextField
                        id="mentorState"
                        name="mentorState"
                        multiline
                        rows="8"
                        value={mentorState}
                        onChange={this.handleChange}
                        className={classes.textField}
                      />
                    </FormControl>
                  </div>
                  <div>
                    <FormControl className={classes.formControl}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={available}
                            onChange={this.handleChangeCheck}
                            color="primary"
                            value="available"
                          />
                        }
                        label="Available"
                      />
                    </FormControl>
                  </div>
                  <div className={classes.buttons}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      className={classes.button}
                    >
                      {btnText}
                    </Button>
                    <Button
                      variant="contained"
                      color="default"
                      component={Link}
                      to={{
                        pathname: "/mentors"
                      }}
                      className={classes.button}
                    >
                      Return to Mentors
                    </Button>
                    {key && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={this.handleClickDeleteMentor}
                        className={classes.button}
                      >
                        <DeleteIcon /> Delete
                      </Button>
                    )}
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          open={openSnackbarSaved}
          autoHideDuration={3000}
          onClose={this.handleSnackbarClose}
          id="openSnackbarSaved"
          name="openSnackbarSaved"
        >
          <SnackbarContentWrapper
            onClose={this.handleSnackbarClose}
            variant="success"
            message="Mentor's information saved!"
          />
        </Snackbar>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          open={openSnackbarError}
          autoHideDuration={3000}
          onClose={this.handleSnackbarClose}
          id="openSnackbarError"
          name="openSnackbarError"
        >
          <SnackbarContentWrapper
            onClose={this.handleSnackbarClose}
            variant="error"
            message={sectionError}
          />
        </Snackbar>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          open={openSnackbarDeleted}
          autoHideDuration={3000}
          onClose={this.handleSnackbarClose}
          id="openSnackbarDeleted"
          name="openSnackbarDeleted"
        >
          <SnackbarContentWrapper
            onClose={this.handleSnackbarClose}
            variant="warning"
            message="Mentor deleted"
          />
        </Snackbar>

        <Dialog
          open={open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Delete mentor?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this mentor?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDeleteMentor} color="primary">
              Yes
            </Button>
            <Button onClick={this.handleClose} color="primary" autoFocus>
              No
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

NewMentor.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NewMentor);
