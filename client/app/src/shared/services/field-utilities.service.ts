import {Injectable} from '@angular/core';
import {Constants} from "../constants/constants";

@Injectable({
  providedIn: 'root'
})
export class FieldUtilitiesService {
  parseQuestionnaire(questionnaire: any, parsedFields: any) {
    let self = this;

    questionnaire.steps.forEach(function (step: any) {
      parsedFields = self.parseFields(step.children, parsedFields);
    });

    return parsedFields;
  }

  underscore(s: any) {
    return s.replace(new RegExp("-", "g"), "_");
  }

  fieldFormName(id: any) {
    return "fieldForm_" + this.underscore(id);
  }

  getValidator(field: any) {
    let validators: any = {
      "custom": field.attrs.regexp ? field.attrs.regexp.value : "",
      "none": "",
      "email": Constants.email_regexp,
      "number": Constants.number_regexp,
      "phonenumber": Constants.phonenumber_regexp,
    };

    if (field.attrs.input_validation) {
      return validators[field.attrs.input_validation.value];
    } else {
      return "";
    }
  }

  getClass(field: any, row_length: number) {
    if (field.width !== 0) {
      return "col-md-" + field.width;
    }

    return "col-md-" + ((row_length > 12) ? 1 : (12 / row_length));
  }

  flatten_field = (id_map: any, field: any): void => {
    if (field.children.length === 0) {
      id_map[field.id] = field;
      return id_map;
    } else {
      id_map[field.id] = field;
      return field.children.reduce(this.flatten_field, id_map);
    }
  };

  build_field_id_map(questionnaire: any) {
    return questionnaire.steps.reduce((id_map: any, cur_step: any) => {
      return cur_step.children.reduce(this.flatten_field, id_map);
    }, {});
  }

  findField(answers_obj: any, field_id: any): any {
    let r;

    for (let key in answers_obj) {
      if (key === field_id) {
        return answers_obj[key][0];
      }

      if (answers_obj.hasOwnProperty(key) && answers_obj[key] instanceof Array && answers_obj[key].length) {
        r = this.findField(answers_obj[key][0], field_id);
        if (typeof r !== "undefined") {
          return r;
        }
      }
    }
    return r;
  }

  splitRows(fields: any) {
    let rows: any = [];
    let y: any = null;

    fields.forEach(function (f: any) {
      if (y !== f.y) {
        y = f.y;
        rows.push([]);
      }

      rows[rows.length - 1].push(f);
    });
    return rows;
  }

  calculateScore(scope: any, field: any, entry: any) {
    let self = this;
    let score, i;

    if (["selectbox", "multichoice"].indexOf(field.type) > -1) {
      for (i = 0; i < field.options.length; i++) {
        if (entry["value"] === field.options[i].id) {
          if (field.options[i].score_type === "addition") {
            scope.points_to_sum += field.options[i].score_points;
          } else if (field.options[i].score_type === "multiplier") {
            scope.points_to_mul *= field.options[i].score_points;
          }
        }
      }
    } else if (field.type === "checkbox") {
      for (i = 0; i < field.options.length; i++) {
        if (entry[field.options[i].id]) {
          if (field.options[i].score_type === "addition") {
            scope.points_to_sum += field.options[i].score_points;
          } else if (field.options[i].score_type === "multiplier") {
            scope.points_to_mul *= field.options[i].score_points;
          }
        }
      }
    } else if (field.type === "fieldgroup") {
      field.children.forEach(function (field: any) {
        entry[field.id].forEach(function (entry: any) {
          self.calculateScore(scope, field, entry);
        });
      });

      return;
    }

    score = scope.points_to_sum * scope.points_to_mul;

    if (score < scope.context.score_threshold_medium) {
      scope.score = 1;
    } else if (score < scope.context.score_threshold_high) {
      scope.score = 2;
    } else {
      scope.score = 3;
    }
  }

  updateAnswers(scope: any, parent: any, list: any, answers: any) {
    let entry, option, i, j;
    let self = this;

    let localscope = this;

    list.forEach(function (field: any) {
      if (self.isFieldTriggered(parent, field, scope.answers, scope.score)) {
        if (!(field.id in answers)) {
          answers[field.id] = [{}];
        }
      } else {
        if (field.id in answers) {
          answers[field.id] = [{}];
        }
      }

      if (field.id in answers) {
        for (i = 0; i < answers[field.id].length; i++) {
          self.updateAnswers(scope, field, field.children, answers[field.id][i]);
        }
      } else {
        self.updateAnswers(scope, field, field.children, {});
      }

      if (!field.enabled) {
        return;
      }

      if (scope.appDataService.public.node.enable_scoring_system) {
        scope.answers[field.id].forEach(function (entry: any) {
          localscope.calculateScore(scope, field, entry);
        });
      }

      for (i = 0; i < answers[field.id].length; i++) {
        entry = answers[field.id][i];

        /* Block related to updating required status */
        if (["inputbox", "textarea"].indexOf(field.type) > -1) {
          entry.required_status = (field.required || field.attrs.min_len.value > 0) && !entry["value"];
        } else if (field.type === "checkbox") {
          if (!field.required) {
            entry.required_status = false;
          } else {
            entry.required_status = true;
            for (j = 0; j < field.options.length; j++) {
              if (entry[field.options[j].id]) {
                entry.required_status = false;
                break;
              }
            }
          }
        } else if (field.type === "fileupload") {
          entry.required_status = field.required && (!scope.uploads[field.id] || !scope.uploads[field.id].size);
        } else {
          entry.required_status = field.required && !entry["value"];
        }

        /* Block related to evaluate options */
        if (["checkbox", "selectbox", "multichoice"].indexOf(field.type) > -1) {
          for (j = 0; j < field.options.length; j++) {
            option = field.options[j];
            option.set = false;
            if (field.type === "checkbox") {
              if (entry[option.id]) {
                option.set = true;
              }
            } else {
              if (option.id === entry["value"]) {
                option.set = true;
              }
            }

            if (option.set) {
              if (option.block_submission) {
                scope.block_submission = true;
              }

              if (option.trigger_receiver.length) {
                scope.replaceReceivers(option.trigger_receiver);
              }
            }
          }
        }
      }
    });
  }

  onAnswersUpdate(scope: any) {
    let self = this;
    scope.block_submission = false;
    scope.score = 0;
    scope.points_to_sum = 0;
    scope.points_to_mul = 1;

    if (!scope.questionnaire) {
      return;
    }

    if (scope.context) {
      scope.submission.setContextReceivers(scope.context.id);
    }

    let localscope = this

    scope.questionnaire.steps.forEach(function (step: any) {
      step.enabled = self.isFieldTriggered(null, step, scope.answers, scope.score);
      localscope.updateAnswers(scope, step, step.children, scope.answers);
    });

    if (scope.context) {
      scope.submission._submission.score = scope.score;
      scope.submission.blocked = scope.block_submission;
    }
  }


  isFieldTriggered(parent: any, field: any, answers: any, score: any) {
    let count = 0;
    let i;

    field.enabled = false;

    if (parent !== null && !parent.enabled) {
      return false;
    }

    if (field.triggered_by_score > score) {
      return false;
    }

    if (!field.triggered_by_options || field.triggered_by_options.length === 0) {
      field.enabled = true;
      return true;
    }

    for (i = 0; i < field.triggered_by_options.length; i++) {
      let trigger = field.triggered_by_options[i];
      let answers_field = this.findField(answers, trigger.field);
      if (typeof answers_field === "undefined") {
        continue;
      }

      // Check if triggering field is in answers object
      if (trigger.option === answers_field.value ||
        (answers_field.hasOwnProperty(trigger.option) && answers_field[trigger.option])) {
        if (trigger.sufficient) {
          field.enabled = true;
          return true;
        }

        count += 1;
      }
    }

    if (count === field.triggered_by_options.length) {
      field.enabled = true;
      return true;
    }

    return false;
  }

  parseFields(fields: any, parsedFields: any) {
    let self = this;

    fields.forEach(function (field: any) {
      parsedFields = self.parseField(field, parsedFields);
    });

    return parsedFields;
  }

  parseField(field: any, parsedFields: any) {
    let self = this;

    if (!Object.keys(parsedFields).length) {
      parsedFields.fields = [];
      parsedFields.fields_by_id = {};
      parsedFields.options_by_id = {};
    }

    if (["checkbox", "selectbox", "multichoice"].indexOf(field.type) > -1) {
      parsedFields.fields_by_id[field.id] = field;
      parsedFields.fields.push(field);
      field.options.forEach(function (option: any) {
        parsedFields.options_by_id[option.id] = option;
      });

    } else if (field.type === "fieldgroup") {
      field.children.forEach(function (field: any) {
        self.parseField(field, parsedFields);
      });
    }

    return parsedFields;
  }


  constructor() {
  }
}
