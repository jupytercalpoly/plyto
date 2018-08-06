from keras.layers import Dense, Dropout, Activation, Flatten
from keras.layers import Convolution2D, MaxPooling2D
from keras.utils import np_utils
from keras.datasets import mnist
from keras.callbacks import Callback
from keras.callbacks import ProgbarLogger
from ipykernel.comm import Comm
from time import time
from .plyto import PlytoAPI


class KerasAccuracyLossCallback(Callback):

    """
    Create a callback that will track and display training progress, loss, and accuracy
    :param total_losses: total loss percentage
    :param total_accuracy: total accuracy percentage
    :param sample_amount: number of samples/steps per epoch
    :param epochs: number of epochs
    :param total_progress: progress of training for all epochs
    :param epoch_progress: progress of training in current epoch
    :param mode: track if model is using samples (0) or steps (1)
    :param loss_data: the current batch's loss and sample amount
    :param accuracy_data: the current batch's accuracy and sample amount
    :param total_runtime: the total runtime for training
    """

    def __init__(self, plyto_instance):
        self.total_losses = []
        self.loss = 0
        self.total_accuracy = []
        self.accuracy = 0
        self.epochs = None
        self.sample_amount = 0
        self.total_progress = 0
        self.current_progress = 0
        self.mode = 0
        self.loss_data = []
        self.accuracy_data = []
        self.total_runtime = 0
        self.starttime = time()
        self.epoch_number = 1
        self.plyto = plyto_instance

    def on_train_begin(self, logs={}):
        """
        Get number of samples/steps per epoch and total number of epochs
        """
        if "samples" in self.params:
            self.sample_amount = self.params["samples"]
        elif "nb_sample" in self.params:
            self.sample_amount = self.params["nb_sample"]
        else:
            self.sample_amount = self.params["steps"]
            self.mode = 1

        self.epochs = self.params["epochs"]
        self.plyto.update_size(self.sample_amount)
        self.plyto.update_total_steps(self.epochs)

    def on_epoch_begin(self, epoch, logs={}):
        """
        Reset the current epoch's progress every new epoch
        """
        self.current_progress = 0
        self.loss = 0
        self.accuracy = 0

    def on_epoch_end(self, epoch, logs={}):
        self.epoch_number += 1
        self.plyto.update_current_step(self.epoch_number)

    def on_batch_end(self, batch, logs={}):
        """
        Update statistics and datasets
        """
        if self.mode == 0:
            self.current_progress += logs.get("size")
            self.total_progress += logs.get("size")
        else:
            self.current_progress += 1
            self.total_progress += 1
        self.loss = logs.get("loss")
        self.total_losses.append(logs.get("loss"))
        loss_item = {"samples": self.total_progress, "loss": self.loss}
        self.loss_data.append(loss_item)
        self.accuracy = logs.get("acc")
        accuracy_item = {"samples": self.total_progress, "accuracy": self.accuracy}
        self.accuracy_data.append(accuracy_item)
        self.total_accuracy.append(logs.get("acc"))
        self.total_runtime = time() - self.starttime
        self.plyto.update_runtime(self.total_runtime)
        self.plyto.update_current_progress(self.current_progress)
        self.plyto.update_total_progress(self.total_progress)
        self.plyto.update_data_set(
            {
                "samples": self.total_progress,
                "loss": self.loss,
                "accuracy": self.accuracy,
            }
        )
        if self.total_progress % 256 == 0 or self.total_progress == (
            self.epochs * self.sample_amount
        ):
            self.plyto.send_data()
