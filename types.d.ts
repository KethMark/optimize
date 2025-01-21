interface AuthCredentials {
  fullName: string
  email: string
  password: string
  message: string
}

interface documentsList {
  id: string;
  users: string;
  fileUrl: string;
  fileName: string;
}

interface DeletePDF  {
  id: string;
  fileName: string;
  text: string;
};

interface ProfileUser  {
  fullname: string;
  email: string;
};

interface ProfileData {
  profileUser: ProfileUser;
  avatarProfile: string; 
};

interface ChatId {
  chatId?: string
}