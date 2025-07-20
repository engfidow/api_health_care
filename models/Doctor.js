import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String }, // store file path or URL
    language: {type: String, default: 'af-somali' },
    appointmentprice: {type: String, default: '10'},
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
