import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from './user';
import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  userData: any;


  constructor(
    public router: Router,
    public ngZone: NgZone,
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
  ) { 
    this.afAuth.authState.subscribe(
      user => {
        if (user) {
          this.userData = user;
          localStorage.setItem('user', JSON.stringify(this.userData));
          // JSON.parse(localStorage.getItem('user'));
        }
        else {
          localStorage.setItem('user', JSON.stringify(null));
          // JSON.parse(localStorage.getItem('user'));
        }
      }
    );
  }


  async authLogin(provider: any) {
    return this.afAuth.signInWithPopup(provider)
    .then(
      result => {
        this.ngZone.run(
          () => {
            this.router.navigate(['dashboard']);
          }
        );
        this.setUserData(result.user);
      }
    )
    .catch(
      error => {
        window.alert(error);
      }
    );
  }


  async forgotPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(
      () => {
        window.alert('Password reset email sent, please check your inbox.');
      }
    )
    .catch(
      error => {
        window.alert(error);
      }
    );
  }


  googleAuth() {
    return this.authLogin(new firebase.default.auth.GoogleAuthProvider());
  }


  get isLoggedIn(): boolean {
    const user = JSON.parse(JSON.stringify(localStorage.getItem('user')));
    return ( user !== null && user.emailVerified !== false) ? true : false;
  }


  async sendVerificationMail() {
    return this.afAuth.currentUser.then(
      user => {
        return user?.sendEmailVerification().then(
          () => {
            this.router.navigate(['verify-email-address']);
          }
        );
      }
    );
  }


  setUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
    return userRef.set(userData, {merge: true});
  }


  async signIn(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
    .then(
      result => {
        this.ngZone.run(
          () => {
            this.router.navigate(['dashboard']);
          }
        );
        this.setUserData(result.user);
      }
    )
    .catch(
      error => {
        window.alert(error.message);
      }
    );
  }


  async signOut() {
    return this.afAuth.signOut().then(
      () => {
        localStorage.removeItem('user');
        this.router.navigate(['sign-in']);
      }
    );
  }


  async signUp(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password)
    .then(
      result => {
        this.sendVerificationMail();
        this.setUserData(result.user);
      }
    )
    .catch(
      error => {
        window.alert(error.message);
      }
    );
  }

}